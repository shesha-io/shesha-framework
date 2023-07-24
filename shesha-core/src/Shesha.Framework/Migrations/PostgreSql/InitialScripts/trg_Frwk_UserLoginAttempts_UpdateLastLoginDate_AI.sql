CREATE TRIGGER "trg_Frwk_UserLoginAttempts_UpdateLastLoginDate_AI"
    AFTER INSERT
    ON public."Frwk_UserLoginAttempts"
    FOR EACH ROW
    EXECUTE FUNCTION public."log_Frwk_UserLoginAttempts_UpdateLastLoginDate_AI"();