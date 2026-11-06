package com.example

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    setContent {
      MyApplicationTheme {
        Scaffold(
          modifier = Modifier
            .fillMaxSize()
            .testTag("main_scaffold")
        ) { innerPadding ->
          Mpu6050DashboardScreen(
            modifier = Modifier
              .fillMaxSize()
              .padding(innerPadding)
              .testTag("dashboard_screen")
          )
        }
      }
    }
  }
}

/**
 * Embedded high-performance web dashboard with pure hardware-accelerated WebView,
 * rendering the MPU6050 Live Motion Dashboard with Web Serial API and CSS 3D Euler Gimbal.
 */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun Mpu6050DashboardScreen(modifier: Modifier = Modifier) {
  val context = LocalContext.current

  Box(
    modifier = modifier.background(androidx.compose.ui.graphics.Color(0xFF0B1020))
  ) {
    AndroidView(
      modifier = Modifier
        .fillMaxSize()
        .testTag("dashboard_webview"),
      factory = { ctx ->
        WebView(ctx).apply {
          layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
          )
          setBackgroundColor(Color.parseColor("#0B1020"))

          settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            loadWithOverviewMode = true
            useWideViewPort = true
            displayZoomControls = false
            builtInZoomControls = false
            allowFileAccess = true
            allowContentAccess = true
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
          }

          webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
              super.onPageFinished(view, url)
              view?.setBackgroundColor(Color.parseColor("#0B1020"))
            }
          }

          webChromeClient = WebChromeClient()

          // Load bundled dashboard asset
          loadUrl("file:///android_asset/index.html")
        }
      },
      update = { _ ->
        // No-op for continuous internal animation
      }
    )
  }
}
