import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:app_settings/app_settings.dart';

class CameraPermissionGuide extends StatelessWidget {
  final VoidCallback onPermissionGranted;

  const CameraPermissionGuide({super.key, required this.onPermissionGranted});

  Future<void> _requestCameraPermission(BuildContext context) async {
    final status = await Permission.camera.request();

    if (status.isGranted) {
      onPermissionGranted();
    } else if (status.isPermanentlyDenied) {
      // 用户永久拒绝了权限，引导他们去设置页面开启
      if (context.mounted) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('需要相机权限'),
            content: const Text('请在设置中允许访问相机，否则无法使用拍题功能。'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('取消'),
              ),
              FilledButton(
                onPressed: () {
                  Navigator.pop(context);
                  AppSettings.openAppSettings();
                },
                child: const Text('去设置'),
              ),
            ],
          ),
        );
      }
    } else {
      // 用户拒绝了权限，但没有勾选"不再询问"
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('没有相机权限，无法使用拍题功能'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.camera_alt, size: 64, color: Colors.grey),
          const SizedBox(height: 16),
          const Text('需要相机权限才能使用拍题功能', style: TextStyle(fontSize: 16)),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: () => _requestCameraPermission(context),
            icon: const Icon(Icons.settings),
            label: const Text('点击开启相机权限'),
          ),
        ],
      ),
    );
  }
}
