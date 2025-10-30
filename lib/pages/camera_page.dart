import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../services/camera_service.dart';
import '../services/question_cache_service.dart';
import '../services/test_mode_service.dart';
import '../services/openai_service.dart';
import 'workspace_page.dart';
import '../models/recognition_mode.dart';
import '../models/camera_state.dart';
import '../models/question.dart';
import '../widgets/camera_permission_guide.dart';
import '../widgets/camera_preview.dart';
import '../widgets/dynamic_camera_guide.dart';
import '../widgets/camera_best_practices.dart';
import '../widgets/photo_confirm_overlay.dart';
import 'cached_questions_page.dart';
import 'question_result_page.dart';
import '../widgets/grid_painter.dart' as grid;

class CameraPage extends StatefulWidget {
  const CameraPage({super.key});

  @override
  State<CameraPage> createState() => _CameraPageState();
}

class _CameraPageState extends State<CameraPage> with SingleTickerProviderStateMixin {
  // UI状态
  bool _hasCachedQuestions = false;
  bool _showGuide = false;
  bool _showBestPractices = false;
  bool _showDynamicGuide = false;
  bool _showGrid = true;
  bool _isFlashOn = false;
  bool _showExposureSlider = false;
  double _currentExposure = 0.0;
  double _maxExposure = 1.0;
  double _minExposure = -1.0;
  
  // 计时器状态
  Timer? _countdownTimer;
  int _countdownSeconds = 0;
  bool _showTimer = false;

    // 批处理状态
  List<File> _batchImages = [];
  RecognitionMode _mode = RecognitionMode.single;
  
  // 边缘检测状态
  Timer? _edgeDetectionTimer;
  
  // 相机状态
  CameraState _cameraState = CameraState.initializing;
  Size _previewSize = const Size(1280, 720);
  
  // 图片相关
  Image? _capturedImage;
  File? _imageFile;
  final List<File> _testImages = [];
  String? _errorMessage;

  // 动画控制
  late final AnimationController _frameAnimationController;
  late final Animation<double> _frameAnimation;
  
  final int _maxRetries = 3;
  @override
  void initState() {
    super.initState();
    _cameraState = CameraState.initializing;
    _frameAnimationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _frameAnimation = CurvedAnimation(
      parent: _frameAnimationController,
      curve: Curves.easeInOut,
    );
    _init();
  }

  Future<void> _init() async {
    if (!TestModeService().isTestMode) {
      await _checkCameraPermission();
    }
    await _checkOfflineCache();
    await _checkShowGuide();

    if (TestModeService().isTestMode) {
      await _loadTestImages();
    }
  }
  


  Future<void> _startCountdown() async {
    setState(() {
      _countdownSeconds = 3;
    });

    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_countdownSeconds > 1) {
          _countdownSeconds--;
        } else {
          _countdownTimer?.cancel();
          _countdownSeconds = 0;
          _takePicture();
        }
      });
    });
  }
  
  Future<void> _takePicture() async {
    if (_cameraState != CameraState.preview) return;

    if (_showTimer && _countdownSeconds == 0) {
      await _startCountdown();
      return;
    }

    setState(() {
      _showBestPractices = false;
      _showDynamicGuide = false;
    });

    File? imageFile;
    String? error;

    // 先对焦
    try {
      if (!TestModeService().isTestMode) {
        await CameraService().controller.setFocusMode(FocusMode.auto);
        await Future.delayed(const Duration(milliseconds: 300));
      }
    } catch (e) {
      print('Focus error: $e');
    }

    // 防抖延时
    setState(() {
      _errorMessage = '请保持手机稳定...';
    });
    await Future.delayed(const Duration(milliseconds: 500));

    setState(() {
      _errorMessage = null;
    });

    // 拍照
    if (TestModeService().isTestMode) {
      if (_testImages.isNotEmpty) {
        imageFile = _testImages.first;
        _testImages.removeAt(0);
      } else {
        error = '测试图片已用完';
      }
    } else {
      try {
        final image = await CameraService().takePicture();
        imageFile = image != null ? File(image.path) : null;
      } catch (e) {
        setState(() {
          _errorMessage = e.toString();
        });
        return;
      }
    }

    if (imageFile != null) {
      final file = imageFile.absolute;
      if (_mode == RecognitionMode.batch) {
        setState(() {
          _batchImages.add(file);
          _cameraState = CameraState.preview;
        });
      } else {
        setState(() {
          _imageFile = file;
          _capturedImage = Image.file(file);
          _cameraState = CameraState.confirm;
        });
        _frameAnimationController.forward();
      }
    }
  }

  Future<void> _processImage(File imageFile) async {
    setState(() {
      _cameraState = CameraState.processing;
      _errorMessage = null;
    });

    try {
      final bytes = await imageFile.readAsBytes();
      if (bytes.length > 5 * 1024 * 1024) {
        throw Exception('图片太大，请选择小于5MB的图片');
      }

      for (var retry = 0; retry < _maxRetries; retry++) {
        try {
          final result = await OpenAIService().recognizeQuestionFromImage(
            imageFile,
          );

          if (!mounted) return;

          // 跳转到演算页面
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => WorkspacePage(
                question: result['question'] as String,
                onSubmitAnswer: (answer) async {
                  if (answer == (result['answer'] as String)) {
                    // 答案正确,跳转到结果页
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (_) => QuestionResultPage(
                          isCorrect: true,
                          content: result['question'] as String,
                          answer: result['answer'] as String,
                          explanation: result['explanation'] as String,
                          subject: Subject.values.firstWhere(
                            (s) => s.toString().toLowerCase() == (result['subject'] as String).toLowerCase(),
                            orElse: () => Subject.math,
                          ),
                          difficulty: int.tryParse(result['difficulty'] as String) ?? 1,
                        ),
                      ),
                    );
                  } else {
                    // 答案错误,显示提示
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('再想想,你已经很接近答案了!'),
                        backgroundColor: Colors.orange,
                        duration: Duration(seconds: 2),
                      ),
                    );
                  }
                },
              ),
            ),
          );
          return;
        } catch (e) {
          if (retry < _maxRetries - 1) {
            setState(() {
              _errorMessage = '让我再想想...';
            });
            await Future.delayed(Duration(seconds: retry + 1));
            continue;
          }
          rethrow;
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = '抱歉,这道题有点难,我需要再学习一下~';
          _cameraState = CameraState.preview;
        });
      }
    }
  }

  Future<void> _checkOfflineCache() async {
    final hasCachedQuestions = await QuestionCacheService()
        .hasOfflineQuestions();
    setState(() {
      _hasCachedQuestions = hasCachedQuestions;
    });
  }

  Future<void> _checkShowGuide() async {
    final prefs = await SharedPreferences.getInstance();
    final hasShownGuide = prefs.getBool('hasShownCameraGuide') ?? false;
    if (!hasShownGuide) {
      setState(() {
        _showGuide = true;
        _showDynamicGuide = true;
      });
      await prefs.setBool('hasShownCameraGuide', true);
    }
  }

  Future<void> _loadTestImages() async {
    try {
      final Directory testImagesDir = Directory('test_images');
      if (await testImagesDir.exists()) {
        final testImages = await testImagesDir
            .list()
            .where(
              (entity) =>
                  entity is File &&
                  (entity.path.endsWith('.jpg') ||
                      entity.path.endsWith('.png')),
            )
            .map((entity) => entity as File)
            .toList();

        setState(() {
          _testImages.addAll(testImages);
        });
      }
    } catch (e) {
      print('Error loading test images: $e');
    }
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _frameAnimationController.dispose();
    if (!TestModeService().isTestMode) {
      CameraService().dispose();
    }
    super.dispose();
  }

  Future<void> _checkCameraPermission() async {
    final status = await Permission.camera.status;
    if (status.isGranted) {
      await _initCamera();
    } else if (status.isPermanentlyDenied) {
      setState(() {
        _errorMessage = '相机权限被永久拒绝，请在系统设置中手动开启';
      });
    } else {
      final result = await Permission.camera.request();
      if (result.isGranted) {
        await _initCamera();
      } else {
        setState(() {
          _errorMessage = '需要相机权限才能使用该功能';
        });
      }
    }
  }

  Future<void> _initCamera() async {
    try {
      await CameraService().initialize();
      await CameraService().startImageStream(_processImageStream);

      setState(() {
        _previewSize = Size(
          CameraService().previewSize?.width ?? 1280,
          CameraService().previewSize?.height ?? 720,
        );
      });
    } catch (e) {
      setState(() {
        _errorMessage = '相机初始化失败：$e';
      });
    }
  }



  void _processImageStream(CameraImage image) {
    // 限制边缘检测的频率，避免过度消耗资源
    if (_edgeDetectionTimer?.isActive ?? false) {
      return;
    }

    _edgeDetectionTimer = Timer(const Duration(milliseconds: 200), () async {
      if (!mounted) return;

      // 边缘检测暂时移除
      print('Edge detection is disabled');
    });
  }

  void _handleConfirm() async {
    if (_capturedImage == null) return;
    
    setState(() {
      _cameraState = CameraState.processing;
      _capturedImage = null;
    });
    await _frameAnimationController.reverse();
    // 继续处理识别
    if (_imageFile != null) {
      await _processImage(_imageFile!);
    }
  }

  void _handleRetake() {
    setState(() {
      _cameraState = CameraState.preview;
      _capturedImage = null;
      _imageFile = null;
    });
    _frameAnimationController.reverse();
  }

  void _handleAdjust() {
    // TODO: 实现图片调整功能
  }



  @override
  Widget build(BuildContext context) {
    if (_showGuide) {
      return Scaffold(
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.camera_alt, size: 64, color: Colors.blue),
                const SizedBox(height: 32),
                const Text(
                  '相机使用指南',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 24),
                const Text(
                  '1. 请将试题放在取景框中心\n'
                  '2. 确保光线充足，避免反光和阴影\n'
                  '3. 保持手机稳定，避免晃动\n'
                  '4. 可以使用网格线辅助对齐\n'
                  '5. 拍摄时尽量保持整张试题纸可见',
                  style: TextStyle(fontSize: 16),
                ),
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: () {
                    setState(() {
                      _showGuide = false;
                    });
                  },
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(200, 48),
                  ),
                  child: const Text('我知道了'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      body: Stack(
        children: [
          // 动态引导
          if (_showDynamicGuide)
            DynamicCameraGuide(
              show: true,
              onComplete: () {
                setState(() {
                  _showDynamicGuide = false;
                  _showBestPractices = true;
                });
              },
            ),
            
          // 最佳实践
          if (_showBestPractices)
            CameraBestPractices(
              onClose: () {
                setState(() {
                  _showBestPractices = false;
                  _showGuide = false;
                });
              },
            ),
            
          // 相机预览
          if (!_showDynamicGuide && !_showBestPractices && _cameraState == CameraState.preview)
            CameraPreviewWidget(
              mode: _mode,
              onCapture: _takePicture,
              onModeToggle: () {
                setState(() {
                  _mode = _mode == RecognitionMode.single
                      ? RecognitionMode.batch
                      : RecognitionMode.single;
                  if (_mode == RecognitionMode.single) {
                    _batchImages.clear();
                  }
                });
              },
              previewSize: _previewSize,
              errorMessage: _errorMessage,
              isProcessing: _cameraState == CameraState.processing,
              detectedCorners: [],
            ),
            
          // 照片确认
          if (_cameraState == CameraState.confirm && _capturedImage != null)
            PhotoConfirmOverlay(
              capturedImage: _capturedImage!,
              frameAnimation: _frameAnimation,
              onConfirm: _handleConfirm,
              onRetake: _handleRetake,
              onAdjust: _handleAdjust,
            ),
            
          // 权限引导
          if (!_showDynamicGuide && !_showBestPractices && _errorMessage == null)
            CameraPermissionGuide(onPermissionGranted: _initCamera),

          if (_showGrid)
            CustomPaint(size: Size.infinite, painter: grid.GridPainter()),

          if (_showExposureSlider)
            Positioned(
              top: 20,
              left: 0,
              right: 0,
              child: Container(
                color: Colors.black54,
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 10,
                ),
                child: Row(
                  children: [
                    const Icon(Icons.brightness_6, color: Colors.white),
                    Expanded(
                      child: Slider(
                        value: _currentExposure,
                        min: _minExposure,
                        max: _maxExposure,
                        onChanged: (value) {
                          setState(() {
                            _currentExposure = value;
                          });
                          CameraService().controller.setExposureOffset(value);
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),



          if (_cameraState == CameraState.processing) 
            const Center(child: CircularProgressIndicator()),

          if (_errorMessage != null)
            Center(
              child: Text(
                _errorMessage!,
                style: const TextStyle(color: Colors.red),
              ),
            ),

          Positioned(
            bottom: 20,
            left: 0,
            right: 0,
            child: Column(
              children: [
                if (_mode == RecognitionMode.batch && _batchImages.isNotEmpty)
                  Container(
                    height: 60,
                    margin: const EdgeInsets.only(bottom: 20),
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      itemCount: _batchImages.length,
                      itemBuilder: (context, index) {
                        return Container(
                          width: 60,
                          height: 60,
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.white),
                            image: DecorationImage(
                              image: FileImage(_batchImages[index]),
                              fit: BoxFit.cover,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    IconButton(
                      icon: Icon(
                        _isFlashOn ? Icons.flash_on : Icons.flash_off,
                        color: Colors.white,
                      ),
                      onPressed: () async {
                        setState(() {
                          _isFlashOn = !_isFlashOn;
                        });
                        await CameraService().setFlashMode(_isFlashOn);
                      },
                    ),
                    IconButton(
                      icon: Icon(
                        _mode == RecognitionMode.single
                            ? Icons.camera_alt
                            : Icons.camera,
                        color: Colors.white,
                      ),
                      onPressed: () => setState(() {
                        _mode = _mode == RecognitionMode.single
                            ? RecognitionMode.batch
                            : RecognitionMode.single;
                        if (_mode == RecognitionMode.single) {
                          _batchImages.clear();
                        }
                      }),
                    ),
                    IconButton(
                      icon: Icon(
                        Icons.grid_on,
                        color: _showGrid ? Colors.yellow : Colors.white,
                      ),
                      onPressed: () => setState(() {
                        _showGrid = !_showGrid;
                      }),
                    ),

                    IconButton(
                      icon: Icon(
                        Icons.brightness_6,
                        color: _showExposureSlider
                            ? Colors.yellow
                            : Colors.white,
                      ),
                      onPressed: () {
                        setState(() {
                          _showExposureSlider = !_showExposureSlider;
                        });
                      },
                    ),
                    if (_hasCachedQuestions)
                      IconButton(
                        icon: const Icon(Icons.history, color: Colors.white),
                        onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const CachedQuestionsPage(),
                          ),
                        ),
                      ),
                    IconButton(
                      icon: const Icon(Icons.help_outline, color: Colors.white),
                      onPressed: () => setState(() => _showGuide = true),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _takePicture,
        child: const Icon(Icons.camera),
      ),
      bottomNavigationBar:
          _mode == RecognitionMode.batch && _batchImages.isNotEmpty
          ? Container(
              color: Colors.black54,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '已拍摄 ${_batchImages.length} 张',
                    style: const TextStyle(color: Colors.white),
                  ),
                  TextButton(
                    onPressed: () async {
                      setState(() {
                        _cameraState = CameraState.processing;
                      });
                      for (final image in _batchImages) {
                        await _processImage(image);
                      }
                      setState(() {
                        _batchImages.clear();
                        _cameraState = CameraState.preview;
                      });
                    },
                    child: const Text('开始识别'),
                  ),
                ],
              ),
            )
          : null,
    );
  }
}


