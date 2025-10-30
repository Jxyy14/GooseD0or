// List of major universities for the dropdown
// This is a curated list of top North American universities
export const UNIVERSITIES = [
  // Canadian Universities
  "University of Waterloo",
  "University of Toronto",
  "McGill University",
  "University of British Columbia",
  "University of Alberta",
  "McMaster University",
  "Queen's University",
  "Western University",
  "University of Calgary",
  "University of Ottawa",
  "Simon Fraser University",
  "Dalhousie University",
  "University of Montreal",
  "Carleton University",
  "York University",
  "Ryerson University",
  "University of Victoria",
  "University of Guelph",
  
  // US Universities (Ivy League + Top Schools)
  "Harvard University",
  "Stanford University",
  "Massachusetts Institute of Technology",
  "California Institute of Technology",
  "Princeton University",
  "Yale University",
  "Columbia University",
  "University of Pennsylvania",
  "Cornell University",
  "Dartmouth College",
  "Brown University",
  "Duke University",
  "Northwestern University",
  "Johns Hopkins University",
  "University of Chicago",
  
  // Top US Public Universities
  "University of California, Berkeley",
  "University of California, Los Angeles",
  "University of California, San Diego",
  "University of California, Santa Barbara",
  "University of California, Irvine",
  "University of Michigan",
  "University of Virginia",
  "Georgia Institute of Technology",
  "University of Illinois Urbana-Champaign",
  "University of Washington",
  "University of Texas at Austin",
  "University of Wisconsin-Madison",
  "University of Maryland",
  "Purdue University",
  "Ohio State University",
  "Penn State University",
  "University of Florida",
  "University of North Carolina at Chapel Hill",
  
  // Tech-focused Universities
  "Carnegie Mellon University",
  "University of California, Davis",
  "Rensselaer Polytechnic Institute",
  "Rochester Institute of Technology",
  "Worcester Polytechnic Institute",
  
  // Other Notable Universities
  "New York University",
  "Boston University",
  "University of Southern California",
  "Northeastern University",
  "University of Massachusetts Amherst",
  "Arizona State University",
  "University of Arizona",
  "Rice University",
  "Vanderbilt University",
  "Emory University",
  "University of Minnesota",
  "Indiana University",
  "University of Iowa",
  "Michigan State University",
  "Rutgers University",
  "Virginia Tech",
  "Texas A&M University",
  "University of Colorado Boulder",
  "University of Pittsburgh",
  "Boston College",
  "Tufts University",
  "Brandeis University",
  "Case Western Reserve University",
  "Lehigh University",
  
  // International Universities
  "University of Oxford",
  "University of Cambridge",
  "Imperial College London",
  "ETH Zurich",
  "National University of Singapore",
  "Nanyang Technological University",
  "University of Hong Kong",
  "Tsinghua University",
  "Peking University",
  "University of Tokyo",
  "University of Melbourne",
  "University of Sydney",
  "University of New South Wales",
  "University of Technology Sydney",
  "Australian National University",
].sort();

// Map common email domains to universities
export const EMAIL_TO_UNIVERSITY: Record<string, string> = {
  "uwaterloo.ca": "University of Waterloo",
  "utoronto.ca": "University of Toronto",
  "mail.utoronto.ca": "University of Toronto",
  "mcgill.ca": "McGill University",
  "mail.mcgill.ca": "McGill University",
  "ubc.ca": "University of British Columbia",
  "student.ubc.ca": "University of British Columbia",
  "ualberta.ca": "University of Alberta",
  "ualberta.edu": "University of Alberta",
  "mcmaster.ca": "McMaster University",
  "queensu.ca": "Queen's University",
  "uwo.ca": "Western University",
  "ucalgary.ca": "University of Calgary",
  "uottawa.ca": "University of Ottawa",
  "sfu.ca": "Simon Fraser University",
  "dal.ca": "Dalhousie University",
  "umontreal.ca": "University of Montreal",
  "carleton.ca": "Carleton University",
  "yorku.ca": "York University",
  "torontomu.ca": "Ryerson University",
  "ryerson.ca": "Ryerson University",
  "uvic.ca": "University of Victoria",
  "uoguelph.ca": "University of Guelph",
  
  // US Universities
  "harvard.edu": "Harvard University",
  "stanford.edu": "Stanford University",
  "mit.edu": "Massachusetts Institute of Technology",
  "caltech.edu": "California Institute of Technology",
  "princeton.edu": "Princeton University",
  "yale.edu": "Yale University",
  "columbia.edu": "Columbia University",
  "upenn.edu": "University of Pennsylvania",
  "cornell.edu": "Cornell University",
  "dartmouth.edu": "Dartmouth College",
  "brown.edu": "Brown University",
  "duke.edu": "Duke University",
  "northwestern.edu": "Northwestern University",
  "jhu.edu": "Johns Hopkins University",
  "uchicago.edu": "University of Chicago",
  "berkeley.edu": "University of California, Berkeley",
  "ucla.edu": "University of California, Los Angeles",
  "ucsd.edu": "University of California, San Diego",
  "ucsb.edu": "University of California, Santa Barbara",
  "uci.edu": "University of California, Irvine",
  "umich.edu": "University of Michigan",
  "virginia.edu": "University of Virginia",
  "gatech.edu": "Georgia Institute of Technology",
  "illinois.edu": "University of Illinois Urbana-Champaign",
  "uw.edu": "University of Washington",
  "washington.edu": "University of Washington",
  "utexas.edu": "University of Texas at Austin",
  "wisc.edu": "University of Wisconsin-Madison",
  "umd.edu": "University of Maryland",
  "purdue.edu": "Purdue University",
  "osu.edu": "Ohio State University",
  "psu.edu": "Penn State University",
  "ufl.edu": "University of Florida",
  "unc.edu": "University of North Carolina at Chapel Hill",
  "cmu.edu": "Carnegie Mellon University",
  "nyu.edu": "New York University",
  "bu.edu": "Boston University",
  "usc.edu": "University of Southern California",
  "northeastern.edu": "Northeastern University",
  "asu.edu": "Arizona State University",
  "rice.edu": "Rice University",
  "vanderbilt.edu": "Vanderbilt University",
  
  // Australian Universities
  "unsw.edu.au": "University of New South Wales",
  "student.unsw.edu.au": "University of New South Wales",
  "ad.unsw.edu.au": "University of New South Wales",
  "uts.edu.au": "University of Technology Sydney",
  "student.uts.edu.au": "University of Technology Sydney",
};

// Function to detect university from email
export function detectUniversityFromEmail(email: string): string | null {
  if (!email) return null;
  
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return null;
  
  // Check direct mapping
  if (EMAIL_TO_UNIVERSITY[domain]) {
    return EMAIL_TO_UNIVERSITY[domain];
  }
  
  // Check for subdomain matches (e.g., student.ubc.ca)
  const baseDomain = domain.split('.').slice(-2).join('.');
  if (EMAIL_TO_UNIVERSITY[baseDomain]) {
    return EMAIL_TO_UNIVERSITY[baseDomain];
  }
  
  return null;
}

