package com.vydia.RNUploader

import android.webkit.CookieManager
import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl

class WebkitCookieManager (private val cookieManager: CookieManager) : CookieJar {

    override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
        cookies.forEach { cookie ->
            cookieManager.setCookie(url.toString(), cookie.toString())
        }
    }

    override fun loadForRequest(url: HttpUrl): List<Cookie> =
        when (val cookies = cookieManager.getCookie(url.toString())) {
            null -> emptyList()
            else -> cookies.split("; ").mapNotNull { Cookie.parse(url, it) }
        }
}