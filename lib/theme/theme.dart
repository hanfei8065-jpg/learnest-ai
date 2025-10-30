import 'package:flutter/material.dart';

class AppTheme {
  // 主色系统
  static const Color primary = Color(0xFF007AFF); // iOS风格蓝色
  static const Color secondary = Color(0xFF5856D6); // 辅助色
  static const Color accent = Color(0xFF34C759); // 强调色
  static const Color error = Color(0xFFFF3B30); // 错误色
  static const Color warning = Color(0xFFFF9500); // 警告色
  static const Color success = Color(0xFF34C759); // 成功色

  // 中性色系统
  static const Color background = Color(0xFFF2F2F7); // 背景色
  static const Color surface = Colors.white; // 表面色
  static const Color text = Color(0xFF000000); // 主文本色
  static const Color textSecondary = Color(0xFF8E8E93); // 次要文本
  static const Color divider = Color(0xFFE5E5EA); // 分割线

  // 圆角定义
  static const double borderRadiusSmall = 8.0; // 小圆角
  static const double borderRadius = 12.0; // 中圆角
  static const double borderRadiusLarge = 16.0; // 大圆角
  static const double borderRadiusXL = 24.0; // 超大圆角

  // 间距系统
  static const double spacingXS = 4.0; // 超小间距
  static const double spacingS = 8.0; // 小间距
  static const double spacingM = 16.0; // 中间距
  static const double spacingL = 24.0; // 大间距
  static const double spacingXL = 32.0; // 超大间距
  static const double spacingXXL = 40.0; // 特大间距

  // 阴影系统
  static List<BoxShadow> get shadowSmall => [
    BoxShadow(
      color: Colors.black.withOpacity(0.05),
      blurRadius: 4,
      offset: const Offset(0, 2),
    ),
  ];

  static List<BoxShadow> get shadowMedium => [
    BoxShadow(
      color: Colors.black.withOpacity(0.08),
      blurRadius: 8,
      offset: const Offset(0, 4),
    ),
  ];

  static List<BoxShadow> get shadowLarge => [
    BoxShadow(
      color: Colors.black.withOpacity(0.12),
      blurRadius: 16,
      offset: const Offset(0, 8),
    ),
  ];

  // 渐变
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF007AFF), Color(0xFF5856D6)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // 透明度系统
  static const double opacityDisabled = 0.38;
  static const double opacityHint = 0.6;
  static const double opacityNormal = 0.87;

  // 动画时长
  static const Duration animationFast = Duration(milliseconds: 200);
  static const Duration animationNormal = Duration(milliseconds: 300);
  static const Duration animationSlow = Duration(milliseconds: 400);
}
