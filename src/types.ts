export type UserRole = 'applicant' | 'admin';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  first_name: string;
  middle_name?: string;
  last_name: string;
  doc_type?: string;
  doc_number?: string;
  gender?: string;
  dob?: string;
  phone?: string;
  country?: string;
  county?: string;
  constituency?: string;
  ward?: string;
  county_id?: number;
  constituency_id?: number;
  ward_id?: number;
  pwd?: string;
  created_at: string;
}

export interface Job {
  id: number;
  title: string;
  department: string;
  description: string;
  location: string;
  deadline: string;
  status: 'Open' | 'Closed';
  created_at: string;
}

export interface Application {
  id: number;
  user_id: number;
  job_id: number;
  ref_number: string;
  status: 'Pending' | 'Shortlisted' | 'Rejected';
  notes?: string;
  applied_at: string;
  job_title?: string;
  department?: string;
  first_name?: string;
  last_name?: string;
  doc_number?: string;
  county?: string;
}

export interface Education {
  id: number;
  user_id: number;
  institution: string;
  qualification: string;
  start_date: string;
  end_date: string;
}

export interface Experience {
  id: number;
  user_id: number;
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
}

export interface Referee {
  id: number;
  user_id: number;
  name: string;
  organization: string;
  phone: string;
  email: string;
}

export interface Document {
  id: number;
  user_id: number;
  name: string;
  type: string;
  size: number;
  url: string;
  created_at: string;
}

export interface County {
  id: number;
  name: string;
}

export interface Constituency {
  id: number;
  county_id: number;
  name: string;
}

export interface Ward {
  id: number;
  constituency_id: number;
  name: string;
}
