import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../services/camera_service.dart';
import '../services/test_mode_service.dart';
import '../services/openai_service.dart';
import '../theme/theme.dart';
import 'workspace_page.dart';
import 'solving_page.dart';
import 'calculator_selection_page.dart';
import '../widgets/crop_bar_overlay.dart';
import 'package:image_picker/image_picker.dart';
import '../models/recognition_mode.dart';
import '../models/camera_state.dart';
import '../models/question.dart';
import '../widgets/permission_bubble.dart';
import '../widgets/camera_preview.dart';
import '../widgets/dynamic_camera_guide.dart';
import '../widgets/camera_best_practices.dart';
import '../widgets/photo_confirm_overlay.dart';
import '../widgets/capture_mode_selector.dart';
import '../widgets/camera_corner_frame.dart';
import 'question_result_page.dart';

class CameraPage extends StatefulWidget {
  const CameraPage({super.key});

  @override
  State<CameraPage> createState() => _CameraPageState();
}

class _CameraPageState extends State<CameraPage>
    with SingleTickerProviderStateMixin, WidgetsBindingObserver {
  // UI状态
  bool _showGuide = false;
  bool _showBestPractices = false;
  bool _showDynamicGuide = false;
  bool _isFlashOn = false;
  bool _showPermissionBubble = false;

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
    WidgetsBinding.instance.addObserver(this);
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

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    print('🔄 应用生命周期变化: $state');
    // 当应用从后台回到前台时，重新检查权限
    if (state == AppLifecycleState.resumed) {
      print('⏰ 应用恢复前台，重新检查权限');
      _recheckPermissionAfterResume();
    }
  }

  Future<void> _recheckPermissionAfterResume() async {
    final wasShowingBubble = _showPermissionBubble;
    await _checkCameraPermission();

    // 如果之前显示气泡，现在权限已授予，显示成功提示
    if (wasShowingBubble && !_showPermissionBubble && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('相机权限已开启'),
          duration: Duration(seconds: 1),
          backgroundColor: Color(0xFF00A86B),
        ),
      );
    }
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

  Future<void> _takePicture() async {
    if (_cameraState != CameraState.preview) return;

    setState(() {
      _showBestPractices = false;
      _showDynamicGuide = false;
    });

    File? imageFile;

    // 先对焦
    try {
      if (!TestModeService().isTestMode) {
        final controller = CameraService().controller;
        if (controller != null) {
          await controller.setFocusMode(FocusMode.auto);
          await Future.delayed(const Duration(milliseconds: 300));
        }
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
        setState(() {
          _errorMessage = '测试图片已用完';
        });
        return;
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
        // 多题模式最多3题
        if (_batchImages.length >= 3) {
          setState(() {
            _errorMessage = '最多只能拍摄3道题';
          });
          Future.delayed(const Duration(seconds: 2), () {
            if (mounted) {
              setState(() {
                _errorMessage = null;
              });
            }
          });
          return;
        }
        
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
                          question: result['question'] as String,
                          answer: result['answer'] as String,
                          explanation: result['explanation'] as String,
                          subject: Subject.values
                              .firstWhere(
                                (s) =>
                                    s.toString().toLowerCase() ==
                                    (result['subject'] as String).toLowerCase(),
                                orElse: () => Subject.math,
                              )
                              .name,
                          difficulty:
                              (int.tryParse(result['difficulty'] as String) ??
                                      1)
                                  .toString(),
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
    // 暂时不需要检查缓存
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
    WidgetsBinding.instance.removeObserver(this);
    _frameAnimationController.dispose();
    if (!TestModeService().isTestMode) {
      CameraService().dispose();
    }
    super.dispose();
  }

  Future<void> _checkCameraPermission() async {
    print('🔍 检查相机权限...');
    final status = await Permission.camera.status;
    print('📷 相机权限状态: $status');
    print('📹 当前相机状态: $_cameraState');
    print('💬 气泡显示状态: $_showPermissionBubble');
    
    // 临时：跳过权限检查，直接初始化相机
    print('✅ 临时强制认为权限已授予');
    // 只有在相机未初始化时才初始化
    if (_cameraState != CameraState.preview &&
        _cameraState != CameraState.processing) {
      print('🚀 开始初始化相机...');
      await _initCamera();
    } else {
      print('✓ 相机已初始化，只需隐藏气泡');
      // 已经初始化，只需隐藏气泡
      if (mounted) {
        setState(() {
          _showPermissionBubble = false;
        });
      }
    }
  }

  Future<void> _initCamera() async {
    print('📸 _initCamera 开始执行');
    try {
      print('1️⃣ 调用 CameraService().initialize()');
      await CameraService().initialize();
      print('2️⃣ 相机初始化成功，开始图像流');
      await CameraService().startImageStream(_processImageStream);
      print('3️⃣ 图像流启动成功');

      if (mounted) {
        setState(() {
          _previewSize = Size(
            CameraService().previewSize?.width ?? 1280,
            CameraService().previewSize?.height ?? 720,
          );
          _cameraState = CameraState.preview;
          _showPermissionBubble = false;
        });
        print('✨ 相机初始化完成，状态已更新');
      }
    } catch (e) {
      print('❌ 相机初始化失败: $e');
      if (mounted) {
        setState(() {
          _errorMessage = '相机初始化失败：$e';
          _cameraState = CameraState.initializing;
        });
      }
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
    if (_capturedImage == null || _imageFile == null) return;

    await _frameAnimationController.reverse();

    // 跳转到新的解题页
    if (mounted) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => SolvingPage(
            questionImages: [_imageFile!], // 单题模式
          ),
        ),
      );

      // 返回预览状态
      setState(() {
        _cameraState = CameraState.preview;
        _capturedImage = null;
        _imageFile = null;
      });
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

  /// 从相册/文件系统选择图片或PDF
  Future<void> _pickImageFromGallery() async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(source: ImageSource.gallery);
      
      if (image != null) {
        final File file = File(image.path);
        
        // 跳转到长条裁剪框模式
        if (mounted) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => CropBarOverlay(
                imageFile: file,
                onConfirm: () {
                  Navigator.pop(context); // 关闭crop overlay
                  // 直接导航到solving page
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => SolvingPage(
                        questionImages: [file],
                      ),
                    ),
                  );
                },
                onCancel: () {
                  Navigator.pop(context);
                },
              ),
            ),
          );
        }
      }
    } catch (e) {
      setState(() {
        _errorMessage = '图片选择失败：$e';
      });
    }
  }

    /// 手电筒开关处理
  Future<void> _handleFlashlightToggle() async {
    final controller = CameraService().controller;
    if (controller == null || !controller.value.isInitialized) {
      return;
    }

    try {
      setState(() {
        _isFlashOn = !_isFlashOn;
      });
      await controller.setFlashMode(
        _isFlashOn ? FlashMode.torch : FlashMode.off,
      );
    } catch (e) {
      setState(() {
        _errorMessage = '手电筒控制失败：$e';
      });
    }
  }

  /// 进入解题页（多题模式）
  void _enterSolvingPage() {
    if (_batchImages.isEmpty) return;
    
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => SolvingPage(
          questionImages: _batchImages, // 传递多张图片（1-3题）
        ),
      ),
    );
    
    // 清空批量图片
    setState(() {
      _batchImages.clear();
    });
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

          // 相机预览占位（权限未授权时显示）
          if (!_showDynamicGuide &&
              !_showBestPractices &&
              _cameraState == CameraState.initializing)
            Container(
              color: Colors.black87,
              child: const Center(
                child: Icon(Icons.camera_alt, size: 100, color: Colors.black45),
              ),
            ),

          // 相机预览
          if (!_showDynamicGuide &&
              !_showBestPractices &&
              _cameraState == CameraState.preview)
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

          // 四个90度角抓手取景框
          if (_cameraState == CameraState.preview)
            CameraCornerFrame(
              frameSize: 280,
              cornerLength: 40,
              cornerWidth: 4,
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

          // 右上角计算器图标
          Positioned(
            top: 50,
            right: 16,
            child: GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const CalculatorSelectionPage(),
                  ),
                );
              },
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.5),
                    width: 1.5,
                  ),
                ),
                child: const Icon(
                  Icons.dialpad,
                  color: Colors.white,
                  size: 32,
                ),
              ),
            ),
          ),

          // 拍照键上方的模式选择器
          Positioned(
            bottom: 140,
            left: 0,
            right: 0,
            child: CaptureModeSelector(
              currentMode: _mode,
              onModeChanged: (mode) {
                setState(() {
                  _mode = mode;
                  // 切换模式时清空批量图片
                  if (mode == RecognitionMode.single) {
                    _batchImages.clear();
                  }
                });
              },
            ),
          ),

          // 底部控制区：左侧文件夹、中心拍照按钮、右侧手电筒
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // 左侧：文件夹图标
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.3),
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: const Icon(
                      Icons.folder_outlined,
                      color: Colors.white,
                      size: 32,
                    ),
                    onPressed: _pickImageFromGallery,
                  ),
                ),
                
                // 中心：拍照按钮
                GestureDetector(
                  onTap: _takePicture,
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                      border: Border.all(
                        color: AppTheme.brandPrimary,
                        width: 4,
                      ),
                    ),
                    child: Center(
                      child: Container(
                        width: 68,
                        height: 68,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppTheme.brandPrimary,
                        ),
                      ),
                    ),
                  ),
                ),
                
                // 右侧：手电筒图标
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.3),
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: Icon(
                      _isFlashOn ? Icons.flashlight_on : Icons.flashlight_off,
                      color: Colors.white,
                      size: 32,
                    ),
                    onPressed: _handleFlashlightToggle,
                  ),
                ),
              ],
            ),
          ),

          // 多题模式：显示已拍摄的缩略图和进入做题页按钮
          if (_mode == RecognitionMode.batch && _batchImages.isNotEmpty)
            Positioned(
              bottom: 140,
              left: 0,
              right: 0,
              child: Column(
                children: [
                  Container(
                    height: 60,
                    margin: const EdgeInsets.only(bottom: 12),
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
                            border: Border.all(
                              color: AppTheme.brandPrimary,
                              width: 2,
                            ),
                            borderRadius: BorderRadius.circular(8),
                            image: DecorationImage(
                              image: FileImage(_batchImages[index]),
                              fit: BoxFit.cover,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  ElevatedButton(
                    onPressed: _enterSolvingPage,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.brandPrimary,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 32,
                        vertical: 12,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                    ),
                    child: Text(
                      '进入解题页 (${_batchImages.length}题)',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),

          // 权限气泡提示 - 放在最上层确保可以点击
          if (_showPermissionBubble &&
              !_showDynamicGuide &&
              !_showBestPractices)
            PermissionBubble(
              onDismiss: () async {
                setState(() {
                  _showPermissionBubble = false;
                });
                // 关闭气泡后重新检查权限
                await _checkCameraPermission();
              },
            ),
        ],
      ),
      bottomNavigationBar: _mode == RecognitionMode.batch && _batchImages.isNotEmpty
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
