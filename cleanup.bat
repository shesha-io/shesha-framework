@ECHO off
cls

ECHO Deleting all BIN, OBJ and node_modules folders...
ECHO.

FOR /d /r . %%d in (bin,obj,node_modules) DO (
	IF EXIST "%%d" (		 	 
		ECHO %%d | FIND /I "\node_modules\" > Nul && ( 
			ECHO.Skipping: %%d
		) || (
			ECHO.Deleting: %%d
			rd /s/q "%%d"
		)
	)
)

ECHO.
ECHO.BIN, OBJ and node_modules folders have been successfully deleted. Press any key to exit.
pause > nul