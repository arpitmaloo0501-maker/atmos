/**
 * mockUsers.js
 * Comprehensive mock citizen registry with geographic coordinates,
 * phone numbers, and location profiles across India.
 */

const MOCK_USERS = [
  // --- CHHATTISGARH (Raipur & Neighboring Districts) ---
  {
    id: "USR-CG-001",
    name: "Ramesh Verma",
    phone: "+919826112233",
    latitude: 21.2382,
    longitude: 81.6661,
    city: "Raipur",
    state: "Chhattisgarh",
    area: "Telibandha",
    language: "hi"
  },
  {
    id: "USR-CG-002",
    name: "Sunita Sahu",
    phone: "+919826445566",
    latitude: 21.2594,
    longitude: 81.6521,
    city: "Raipur",
    state: "Chhattisgarh",
    area: "Pandri Cloth Market",
    language: "hi"
  },
  {
    id: "USR-CG-003",
    name: "Alok Agrawal",
    phone: "+919425223344",
    latitude: 21.2612,
    longitude: 81.5641,
    city: "Raipur",
    state: "Chhattisgarh",
    area: "Tatibandh Industrial Area",
    language: "en"
  },
  {
    id: "USR-CG-004",
    name: "Pooja Dewangan",
    phone: "+919827011223",
    latitude: 21.2144,
    longitude: 81.3804,
    city: "Bhilai",
    state: "Chhattisgarh",
    area: "Sector 6 / Civic Center",
    language: "hi"
  },
  {
    id: "USR-CG-005",
    name: "Vikram Chandrakar",
    phone: "+919926887766",
    latitude: 21.1904,
    longitude: 81.2849,
    city: "Durg",
    state: "Chhattisgarh",
    area: "Station Road Durg",
    language: "hi"
  },
  {
    id: "USR-CG-006",
    name: "Bhupendra Baghel",
    phone: "+919424119988",
    latitude: 22.0797,
    longitude: 82.1409,
    city: "Bilaspur",
    state: "Chhattisgarh",
    area: "Vyapar Vihar",
    language: "hi"
  },

  // --- MAHARASHTRA (Mumbai MMR & Surrounds) ---
  {
    id: "USR-MH-101",
    name: "Priya Kulkarni",
    phone: "+919820123456",
    latitude: 19.1136,
    longitude: 72.8697,
    city: "Mumbai",
    state: "Maharashtra",
    area: "Andheri East",
    language: "mr"
  },
  {
    id: "USR-MH-102",
    name: "Aditya Deshmukh",
    phone: "+919819987654",
    latitude: 19.0596,
    longitude: 72.8295,
    city: "Mumbai",
    state: "Maharashtra",
    area: "Bandra West",
    language: "en"
  },
  {
    id: "USR-MH-103",
    name: "Neeta Shinde",
    phone: "+919821456789",
    latitude: 19.2183,
    longitude: 72.9781,
    city: "Thane",
    state: "Maharashtra",
    area: "Majiwada",
    language: "mr"
  },
  {
    id: "USR-MH-104",
    name: "Sameer Patel",
    phone: "+919833567890",
    latitude: 19.0330,
    longitude: 73.0297,
    city: "Navi Mumbai",
    state: "Maharashtra",
    area: "Vashi",
    language: "en"
  },
  {
    id: "USR-MH-105",
    name: "Anand Joshi",
    phone: "+919850112244",
    latitude: 18.5204,
    longitude: 73.8567,
    city: "Pune",
    state: "Maharashtra",
    area: "Shivajinagar",
    language: "mr"
  },

  // --- DELHI NCR ---
  {
    id: "USR-DL-201",
    name: "Arjun Khanna",
    phone: "+919811023456",
    latitude: 28.6328,
    longitude: 77.2197,
    city: "New Delhi",
    state: "Delhi",
    area: "Connaught Place",
    language: "en"
  },
  {
    id: "USR-DL-202",
    name: "Meenakshi Bansal",
    phone: "+919810145678",
    latitude: 28.5921,
    longitude: 77.0460,
    city: "New Delhi",
    state: "Delhi",
    area: "Dwarka Sector 10",
    language: "hi"
  },
  {
    id: "USR-DL-203",
    name: "Rohit Malhotra",
    phone: "+919818876543",
    latitude: 28.5355,
    longitude: 77.3910,
    city: "Noida",
    state: "Uttar Pradesh",
    area: "Sector 62",
    language: "hi"
  },
  {
    id: "USR-DL-204",
    name: "Deepak Yadav",
    phone: "+919812345678",
    latitude: 28.4595,
    longitude: 77.0266,
    city: "Gurugram",
    state: "Haryana",
    area: "Cyber City",
    language: "en"
  },

  // --- GOA ---
  {
    id: "USR-GA-301",
    name: "Maria Fernandes",
    phone: "+919822114455",
    latitude: 15.4909,
    longitude: 73.8278,
    city: "Panaji",
    state: "Goa",
    area: "Fontainhas",
    language: "en"
  },
  {
    id: "USR-GA-302",
    name: "Joao D'Souza",
    phone: "+919823556677",
    latitude: 15.2832,
    longitude: 73.9862,
    city: "Margao",
    state: "Goa",
    area: "Comba",
    language: "en"
  },

  // --- GUJARAT ---
  {
    id: "USR-GJ-401",
    name: "Jignesh Shah",
    phone: "+919825012345",
    latitude: 23.2156,
    longitude: 72.6369,
    city: "Gandhinagar",
    state: "Gujarat",
    area: "Sector 21",
    language: "gu"
  },
  {
    id: "USR-GJ-402",
    name: "Bhavna Trivedi",
    phone: "+919879123456",
    latitude: 23.0225,
    longitude: 72.5714,
    city: "Ahmedabad",
    state: "Gujarat",
    area: "Navrangpura",
    language: "gu"
  },

  // --- ODISHA ---
  {
    id: "USR-OD-501",
    name: "Debashish Mohanty",
    phone: "+919437012345",
    latitude: 20.2961,
    longitude: 85.8245,
    city: "Bhubaneswar",
    state: "Odisha",
    area: "Saheed Nagar",
    language: "or"
  },
  {
    id: "USR-OD-502",
    name: "Subhashree Patnaik",
    phone: "+919438987654",
    latitude: 20.4625,
    longitude: 85.8830,
    city: "Cuttack",
    state: "Odisha",
    area: "Badambadi",
    language: "or"
  }
];

module.exports = {
  MOCK_USERS
};
