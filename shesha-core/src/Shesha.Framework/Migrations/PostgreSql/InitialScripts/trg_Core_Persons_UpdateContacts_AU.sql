CREATE TRIGGER "trg_Core_Persons_UpdateContacts_AU"
    AFTER UPDATE 
    ON public."Core_Persons"
    FOR EACH ROW
    EXECUTE FUNCTION public."log_Core_Persons_UpdateContacts_AU"();