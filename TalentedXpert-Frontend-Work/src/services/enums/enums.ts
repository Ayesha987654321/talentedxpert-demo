export enum sortOrderEnum {
  ASC = "ASC",
  DESC = "DESC",
}

export enum listingLimitEnum {
  TEN = "10",
  TWENTYfIVE = "25",
  FIFTY = "50",
  HUNDRED = "100",
}

export enum UserType {
  INDIVIDUAL = "Individual",
  ORGANIZATION = "Organization",
}

export enum ProfileType {
  TE = "TE",
  TR = "TR",
}

export enum TaskType {
  ONLINE = "Online",
  ONSITE = "Onsite",
}

export enum AmountType {
  FIXED = "Fixed",
  HOURLY = "Hourly",
}

export enum ProposalStatus {
  "" = "All Proposals",
  SUBMITTED = "Submitted",
  SHORTLISTED = "Shortlisted",
  CONTRACTED = "Contracted",
  HIRED = "Hired",
  REJECTED = "Rejected",
  CLOSED = "Closed",
}

export enum TaskStatusTE {
  "" = "New Tasks",
  PROPOSALS = "Proposals",
  INPROGRESS = "In Progress",
  COMPLETED = "Completed",
  CLOSED = "Closed",
}

export enum TaskStatusTR {
  // '' = 'All',
  POSTED = "Posted",
  INPROGRESS = "In Progress",
  COMPLETED = "Completed",
  CLOSED = "Closed",
}

export enum QuestionType {
  TEXT = "Text",
  DROPDOWN = "Dropdown",
  // CHECKBOX = 'Checkbox',
  RADIO = "Radio",
  TEXTAREA = "Textarea",
}

export enum invitationStatus {
  PENDING = "Pending",
  ACCEPTED = "Accepted",
  REJECTED = "Rejected",
}

export enum teamTypeEnum {
  created = "My Teams",
  member = "Affiliated",
}

export enum msgType {
  USER = 'USER', 
  ADMIN = 'ADMIN', 
  SYSTEM = 'SYSTEM', 
  TEAM = 'TEAM'
}
