CREATE OR REPLACE FUNCTION public."log_Core_Persons_UpdateContacts_AU"()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
BEGIN
	IF OLD."MobileNumber1" <> NEW."MobileNumber1" OR OLD."EmailAddress1" <> NEW."EmailAddress1" THEN
		update 
			"AbpUsers" 
		set 
			"PhoneNumber" = NEW."MobileNumber1",
			"EmailAddress" = NEW."EmailAddress1"
		where
			"AbpUsers"."Id" = OLD."UserId";
	END IF;

	RETURN NEW;
END;
$BODY$;
