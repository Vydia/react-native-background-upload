require 'json'
version = JSON.parse(File.read('package.json'))["version"]

Pod::Spec.new do |s|

  s.name           = "VydiaRNFileUploader"
  s.version        = version
  s.summary        = "iOS wrapper for React Native background file upload"
  s.homepage       = "https://github.com/Vydia/react-native-background-upload"
  s.license        = "MIT"
  s.author         = { "Vydia" => "example@email.com" }
  s.platform       = :ios, "7.0"
  s.source         = { :git => "https://github.com/Vydia/react-native-background-upload.git", :tag => "v#{s.version}" }
  s.source_files   = 'VydiaRNFileUploader/**/*.{h,m}'
  s.preserve_paths = "**/*.js"
  s.dependency 'React'

end