# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# QuickBingo ProGuard Kuralları - Maksimum Güvenlik

# Temel Android kuralları
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-verbose

# Kod optimizasyonları
-allowaccessmodification
-repackageclasses ''
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5

# Capacitor için korunacak sınıflar
-keep class com.getcapacitor.** { *; }
-keep class com.mtgsoftworks.quickbingo.MainActivity { *; }

# Firebase/AdMob için korunacak sınıflar
-keep class com.google.android.gms.** { *; }
-keep class com.google.firebase.** { *; }
-dontwarn com.google.android.gms.**
-dontwarn com.google.firebase.**

# JavaScript interface koruması
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Native method koruması
-keepclasseswithmembernames class * {
    native <methods>;
}

# Reflection kullanılan sınıfları koru
-keepclassmembers class * {
    public <init>(android.content.Context, android.util.AttributeSet);
    public <init>(android.content.Context, android.util.AttributeSet, int);
}

# Enum koruması
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Parcelable koruması
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Serializable koruması
-keepnames class * implements java.io.Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# WebView koruması
-keep class android.webkit.WebView { *; }
-keep class * extends android.webkit.WebViewClient { *; }
-keep class * extends android.webkit.WebChromeClient { *; }

# Capacitor plugin koruması
-keep @com.getcapacitor.annotation.CapacitorPlugin class * {
    @com.getcapacitor.annotation.PermissionCallback <methods>;
    @com.getcapacitor.annotation.ActivityCallback <methods>;
    @com.getcapacitor.PluginMethod public <methods>;
}

# Güçlü obfuscation - String şifreleme
-adaptclassstrings
-adaptresourcefilenames **.properties,**.xml,**.html,**.htm
-adaptresourcefilecontents **.properties,META-INF/MANIFEST.MF

# Stack trace'leri karıştır
-renamesourcefileattribute SourceFile
-keepattributes SourceFile,LineNumberTable

# Saldırı tespiti - Anti-tampering
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
    public static *** w(...);
    public static *** e(...);
}

# Kritik paket adlarını gizle
-repackageclasses 'a'
-flattenpackagehierarchy 'a'

# Unused code kaldır
-dontwarn **
-ignorewarnings
