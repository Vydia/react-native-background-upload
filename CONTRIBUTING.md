## Issues 

According to Google. From November 1, 2019, all updates must target at least Android 9.0 / API level 28. Furthermore, all new uploads have to comply with this requirement. If you're build a new app, this is the basic requirement. When using RN 0.60+ you have to upgrade the minsdk or else the app will either not build or the background upload will crash while trying to update. Issue #169 details this issue further.

[Repro](https://github.com/teeolendo/ReactNativeBackgroundUploadExample)
