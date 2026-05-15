!macro registerProtocol
  WriteRegStr SHCTX "Software\Classes\khoj" "" "URL:Khoj Protocol"
  WriteRegStr SHCTX "Software\Classes\khoj" "URL Protocol" ""
  WriteRegStr SHCTX "Software\Classes\khoj\shell\open\command" "" '"$INSTDIR\khoj.exe" "%1"'
!macroend

Function .onInstSuccess
  !insertmacro registerProtocol
FunctionEnd
