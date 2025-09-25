export const DEFAULT_MOCK_PERSONS = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    jobTitle: "Senior Project Manager",
    _className: "Person"
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Doe",
    jobTitle: "Chief Executive Officer",
    _className: "Person"
  },
  {
    id: "3",
    firstName: "Bob",
    lastName: "Doe",
    jobTitle: "Software Engineer",
    _className: "Person"
  },
  {
    id: "4",
    firstName: "Sarah",
    lastName: "Smith",
    jobTitle: "UX Designer",
    _className: "Person"
  }
];

export const getDefaultMockData = (orientation: string = 'vertical', itemCount?: number) => {
  if (orientation === 'vertical') {
    return DEFAULT_MOCK_PERSONS.slice(0, itemCount || 3);
  }
  return DEFAULT_MOCK_PERSONS.slice(0, itemCount || 4);
};