// import { LearnerDetailsDto } from 'api/learners';
// import { SchoolDto } from 'api/schools';
// import { HASH_COUNTER } from 'app-constants';
// import { APPLICATION_HINTS } from 'app-constants/messages';
// import { LEARNER_APPLICATION_TOKEN_NAME } from 'app-constants/token';
// import { RefListApplicationType, RefListGender, RefListSchoolType, SettingsType } from 'enums';
// import { IAppStorage } from 'models';
// import { ICreateSchoolApplication } from 'providers/schoolApplications/contexts';
// import { IndexColumnDataType } from 'shesha';
// import ConfigManager from 'utils/configManager';
 
// const { pageSize } = new ConfigManager().getConfig();
 
// /**
// * Returns the dataType of a given value
// * @param value - the value to check against
// * @returns IndexColumnDataType
// */
// export const getIndexTableColumnDataType = (value: any): IndexColumnDataType => {
//   if (typeof value === 'boolean') return 'boolean';
//   else if (!isNaN(value)) return 'number';
//   else if (Date.parse(value)) return 'date';
//   else if (typeof value === 'string') return 'string';
 
//   return 'other';
// };
 
// export const trimValue = (value: string) => {
//   if (value) {
//     return value.trim().replace(/\s+/g, '');
//   }
 
//   return value;
// };
 
// export const validateEmailAddress = email => {
//   const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
 
//   if (email) return re.test(String(email.trim()).toLowerCase());
 
//   return true;
// };
 
// export const validatePhoneNo = cellNo => {
//   const re = /^0(6|7|8){1}[0-9]{1}[0-9]{7}$/;
//   return re.test(String(trimValue(cellNo)).toLowerCase());
// };
 
// export const gradeType = (grade: number) => {
//   if (grade >= 1 && grade <= 7) {
//     return RefListSchoolType.PrimarySchool;
//   } else if (grade >= 8 && grade <= 12) {
//     return RefListSchoolType.SecondarySchool;
//   }
// };
 
// export const gradeMatch = (grade: number, siblingGrade: number) => {
//   if (grade && siblingGrade) {
//     if (gradeType(grade) === gradeType(siblingGrade)) {
//       return true;
//     }
//   }
//   return false;
// };
 
// export const capitalize = (str: string) => {
//   if (!str) return null;
//   return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
// };
 
// export const schoolCount = (num: number) => {
//   if (num) {
//     if (num === 0) {
//       return 'No';
//     } else if (num > 50) {
//       return '50+';
//     }
 
//     return num.toString();
//   }
 
//   return 'No';
// };
 
// export const validateSchoolId = (id: string) => {
//   let value = '';
 
//   if (id) {
//     for (const item of id) {
//       value += item.replace('-', '').replace('0', '');
//     }
//   }
 
//   return !!value;
// };
 
// export const filterSchools = (schools: SchoolDto[]) => {
//   const token = sessionStorage.getItem(LEARNER_APPLICATION_TOKEN_NAME);
 
//   let list: SchoolDto[] = [...schools];
 
//   if (token) {
//     const { body } = JSON.parse(token) as IAppStorage<ICreateSchoolApplication[]>;
 
//     list = schools.filter(({ id }) => {
//       let exit = true;
//       for (const { schoolId } of body) {
//         if (id === schoolId) {
//           exit = false;
//         }
//       }
//       return exit;
//     });
//   }
 
//   return list;
// };
 
// export const mutateValueType = (value, inputType: 'default' | 'numeric' | 'string') => {
//   if (value) {
//     switch (inputType) {
//       case 'numeric':
//         return value.toString().replace(/[^0-9]/g, '');
//       case 'string':
//         return value.toString().replace(/[^a-zA-Z -]+/, '');
//       default:
//         return value;
//     }
//   }
 
//   return value;
// };
 
// export const searchSchoolFilter = (schools: SchoolDto[], searchValue: string) =>
//   schools.filter(({ name }) => name && name.toLowerCase().includes(searchValue.toLowerCase())).slice(0, pageSize);
 
// export const filterTopSchools = (schools: SchoolDto[]) => schools.slice(0, pageSize);
 
// export const filterTenSchools = (schools: SchoolDto[], filter: boolean) => {
//   if (!filter) {
//     return schools.filter(({ distanceInKMsToPOI }) => distanceInKMsToPOI <= 10).slice(0, 10);
//   }
 
//   return schools;
// };
 
// export const canParentTransfer = (
//   learners: LearnerDetailsDto[],
//   learnerId: string,
//   applicationId: string,
//   transferTypeId: number
// ) =>
//   !!learners
//     ?.find(({ learner }) => learner.id === learnerId)
//     ?.applications?.find(
//       ({ id, canParentTransferQualifyingApplication, canParentTransferUnqualifyingApplication }) =>
//         id === applicationId &&
//         (canParentTransferQualifyingApplication || canParentTransferUnqualifyingApplication) &&
//         [SettingsType.AllowParentTransferQualifying, SettingsType.AllowParentTransferUnQualifying].includes(
//           transferTypeId
//         )
//     );
 
// export const hashIdNumber = (value: string) => {
//   if (value && value.length > HASH_COUNTER) {
//     const first6Digits = value.substring(0, HASH_COUNTER);
//     const hashedDigits = [...value.substring(HASH_COUNTER)].map(() => '*').join('');
//     return first6Digits + hashedDigits;
//   }
//   return value;
// };
 
// export const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U']);
// export const CONSONANTS = new Set();
 
// for (let charCode = 65; charCode < 91; charCode++) {
//   const char = String.fromCharCode(charCode);
//   if (!VOWELS.has(char)) CONSONANTS.add(char);
// }
 
// for (let charCode = 97; charCode < 123; charCode++) {
//   const char = String.fromCharCode(charCode);
//   if (!VOWELS.has(char)) CONSONANTS.add(char);
// }
 
// export const filterToVowel = (str: string) => {
//   const result = [];
 
//   for (const char of str) {
//     if (!CONSONANTS.has(char)) result.push(char);
//     else result.push('_');
//   }
 
//   return result.join('');
// };
 
// export const fixToDate = (str: string) => {
//   if (str) return `${str.substr(0, 4)}-${str.substr(4, 2)}-${str.substr(6, 2)}`;
 
//   return '';
// };
 
// export const getUserGender = (str: string) => {
//   if (str) return parseInt(str.substring(6, 10), 0) < 5000 ? RefListGender.Female : RefListGender.Male;
//   return 0;
// };
 
// export const getApplicationHintMsg = (applicationType: number, address: string) => {
//   if (applicationType !== RefListApplicationType.HomeAddressWithinSchoolsFeederZone) {
//     if (applicationType === RefListApplicationType.WorkAddressWithinSchoolsFeederZone && !address) {
//       return APPLICATION_HINTS[2];
//     } else {
//       return APPLICATION_HINTS[1];
//     }
//   } else {
//     return APPLICATION_HINTS[0];
//   }
// };
 
// export const getApplicationHintPrefix = (applicationType: number, address: string) => {
//   if (applicationType === RefListApplicationType.WorkAddressWithinSchoolsFeederZone && !address) {
//     return 'Warning';
//   } else {
//     return 'Note';
//   }
// };
 
export const prepareInputMask = (value: string) => {
  if (value) {
    const mask = [...value];
    for (let i = 0; i < mask.length; i++) {
      const char = mask[i];
      if (char === '_') {
        mask[i] = 'A';
      } else if (char === 'a') {
        mask[i] = '\\a';
      } else if (char === 'A') {
        mask[i] = '\\A';
      }
    }
    return mask.join('');
  }
  return null;
};

export const maskValue = (value: string, maskstart: number, maskEnd: number, mask: any) => {
  return value.split('').map((char, index) => {
    if (index >= maskstart && index <= maskEnd) {
      return mask;
    }
    return char;
  
  }).join('');
}
 
// export const splitAddress = (address: string) => address?.split(',');
 
// export const assertIsPermanentResident = (idNumber: string) => idNumber[10] === '1';
 
// export const removeTrailingSlash = (pathname: string) =>
//   pathname === '/' ? pathname : pathname.endsWith('/') ? pathname.substr(0, pathname.length - 1) : pathname;
 
// export const emptySchoolResultMsg = (isLateApplication: boolean) =>
//   isLateApplication ? 'No School(s) with Capacity are Available' : 'No School(s) Match This Criteria';
 
// export const schoolResultSubTitle = (text: string) => (text ? text : 'schools');
 
// export const generateTransferTypeId = (qualify: boolean) =>
//   (qualify ? SettingsType.AllowParentTransferQualifying : SettingsType.AllowParentTransferUnQualifying).toString();
 