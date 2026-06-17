import { useEffect, useState } from "react";
import ServiceCard from "../components/ServiceCard";
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaMapMarkerAlt,
  FaStar,
  FaBirthdayCake,
  FaRing,
  FaBriefcase,
  FaUtensils,
  FaCamera,
  FaPalette,
  FaMusic,
  FaBuilding,
  FaHeart,
  FaShare,
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaRupeeSign,
  FaCheckCircle,
  FaTrophy,
  FaUsers,
  FaClock,
} from "react-icons/fa";

// Import local images (place these in src/assets/images/)
import birthdayImg from "../assets/images/birthday-planner.jpg";
import weddingImg from "../assets/images/wedding-planner.jpg";
import corporateImg from "../assets/images/corporate-event.jpg";
import cateringImg from "../assets/images/catering.jpg";
import photographyImg from "../assets/images/photography.jpg";
import decorationImg from "../assets/images/decoration.jpg";
import musicImg from "../assets/images/music-dj.jpg";
import venueImg from "../assets/images/venue.jpg";
import cakeImg from "../assets/images/cake-artist.jpg";

function Events() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [wishlist, setWishlist] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 12;

  // Service Types with Icons and Images
  const serviceTypes = [
    {
      name: "Birthday Planner",
      icon: <FaBirthdayCake />,
      color: "#FF6B6B",
      image: birthdayImg,
      description: "Make your birthday magical",
      count: 45,
    },
    {
      name: "Wedding Planner",
      icon: <FaRing />,
      color: "#FF69B4",
      image: weddingImg,
      description: "Perfect wedding coordination",
      count: 32,
    },
    {
      name: "Corporate Event",
      icon: <FaBriefcase />,
      color: "#4A90E2",
      image: corporateImg,
      description: "Professional event management",
      count: 28,
    },
    {
      name: "Catering",
      icon: <FaUtensils />,
      color: "#F39C12",
      image: cateringImg,
      description: "Delicious food for all",
      count: 56,
    },
    {
      name: "Photography",
      icon: <FaCamera />,
      color: "#9B59B6",
      image: photographyImg,
      description: "Capture your memories",
      count: 48,
    },
    {
      name: "Decoration",
      icon: <FaPalette />,
      color: "#E74C3C",
      image: decorationImg,
      description: "Stunning decorations",
      count: 52,
    },
    {
      name: "Music & DJ",
      icon: <FaMusic />,
      color: "#1ABC9C",
      image: musicImg,
      description: "Entertainment & music",
      count: 38,
    },
    {
      name: "Venue",
      icon: <FaBuilding />,
      color: "#34495E",
      image: venueImg,
      description: "Perfect event venues",
      count: 42,
    },
    {
      name: "Cake Artist",
      icon: "🍰",
      color: "#E67E22",
      image: cakeImg,
      description: "Custom delicious cakes",
      count: 35,
    },
  ];

  // Indian Cities by State for comprehensive coverage
  const citiesByState = {
    Maharashtra: [
      "Mumbai",
      "Pune",
      "Nagpur",
      "Nashik",
      "Thane",
      "Aurangabad",
      "Solapur",
      "Kolhapur",
    ],
    "Delhi NCR": [
      "New Delhi",
      "Gurugram",
      "Noida",
      "Faridabad",
      "Ghaziabad",
      "Dwarka",
      "Rohini",
    ],
    Karnataka: [
      "Bangalore",
      "Mysore",
      "Hubli",
      "Mangalore",
      "Belgaum",
      "Gulbarga",
    ],
    "Tamil Nadu": [
      "Chennai",
      "Coimbatore",
      "Madurai",
      "Tiruchirappalli",
      "Salem",
      "Tirunelveli",
    ],
    Telangana: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol"],
    "Uttar Pradesh": [
      "Lucknow",
      "Kanpur",
      "Agra",
      "Varanasi",
      "Prayagraj",
      "Noida",
      "Ghaziabad",
    ],
    Gujarat: [
      "Ahmedabad",
      "Surat",
      "Vadodara",
      "Rajkot",
      "Bhavnagar",
      "Jamnagar",
    ],
    Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner"],
    Punjab: ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
    Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Kollam"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
    "Andhra Pradesh": [
      "Visakhapatnam",
      "Vijayawada",
      "Guntur",
      "Nellore",
      "Tirupati",
    ],
    Haryana: ["Faridabad", "Gurugram", "Panipat", "Ambala", "Hisar"],
    Bihar: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga"],
    Odisha: ["Bhubaneswar", "Cuttack", "Rourkela", "Puri", "Berhampur"],
    Goa: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
    "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Kullu", "Mandi"],
    Uttarakhand: ["Dehradun", "Haridwar", "Rishikesh", "Nainital", "Haldwani"],
    Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"],
    Assam: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur"],
  };

  const allCities = Object.values(citiesByState).flat();

  // Generate 100+ Service Providers
  const generateServiceProviders = () => {
    const providers = [];
    let id = 1;

    const serviceTypesList = [
      "Birthday Planner",
      "Wedding Planner",
      "Corporate Event",
      "Catering",
      "Photography",
      "Decoration",
      "Music & DJ",
      "Venue",
      "Cake Artist",
    ];
    const names = {
      "Birthday Planner": [
        "Priya",
        "Rajesh",
        "Neha",
        "Amit",
        "Sneha",
        "Vikram",
        "Pooja",
        "Rahul",
        "Anjali",
        "Manish",
        "Divya",
        "Kunal",
        "Shreya",
        "Nitin",
        "Karishma",
      ],
      "Wedding Planner": [
        "Kavita",
        "Sanjay",
        "Meera",
        "Alok",
        "Sunita",
        "Rakesh",
        "Shilpa",
        "Ankur",
        "Nisha",
        "Tarun",
        "Ritu",
        "Pankaj",
        "Jyoti",
        "Vijay",
        "Geeta",
      ],
      "Corporate Event": [
        "Rohit",
        "Anita",
        "Vikas",
        "Swati",
        "Rajiv",
        "Monica",
        "Deepak",
        "Preeti",
        "Saurabh",
        "Neelam",
        "Ajay",
        "Kiran",
        "Mohit",
        "Rekha",
        "Gaurav",
      ],
      Catering: [
        "Chef Sanjeev",
        "Chef Ranveer",
        "Chef Tarla",
        "Chef Kunal",
        "Chef Vineet",
        "Chef Madhur",
        "Chef Nita",
        "Chef Harpal",
        "Chef Rakhee",
        "Chef Manish",
      ],
      Photography: [
        "Sagar",
        "Rahul",
        "Priyanka",
        "Arjun",
        "Nikita",
        "Karan",
        "Aditi",
        "Varun",
        "Shivani",
        "Tarun",
        "Deepa",
        "Naveen",
        "Ishita",
        "Raj",
        "Meghna",
      ],
      Decoration: [
        "Dreamcatcher",
        "Magic Moments",
        "Royal Decor",
        "Artistic Blooms",
        "Celebration Decor",
        "Wedding Dazzle",
        "Eventify",
        "Glam Decor",
        "Perfect Setup",
        "Style Decor",
      ],
      "Music & DJ": [
        "DJ Aryan",
        "DJ Rohan",
        "DJ Meera",
        "DJ Simran",
        "DJ Varun",
        "DJ Neha",
        "DJ Karan",
        "DJ Anushka",
        "DJ Vikas",
        "DJ Pooja",
      ],
      Venue: [
        "Grand Palace",
        "Royal Garden",
        "Celebration Hall",
        "Luxury Resort",
        "City Club",
        "Heritage Hotel",
        "Beach Resort",
        "Farmhouse",
        "Convention Center",
        "Sky Lounge",
      ],
      "Cake Artist": [
        "Sweet Creations",
        "Cake Magic",
        "Baking Delights",
        "Frost Art",
        "Sugar Dreams",
        "The Cake Studio",
        "Buttercream Bliss",
        "Couture Cakes",
        "Bake My Day",
        "Cake Fantasy",
      ],
    };

    const businessSuffixes = {
      "Birthday Planner": [
        "Events",
        "Celebrations",
        "Parties",
        "Birthday Special",
        "Kids Party",
      ],
      "Wedding Planner": [
        "Weddings",
        "Shaadi",
        "Matrimony",
        "Wedding Dreams",
        "Vivah",
      ],
      "Corporate Event": [
        "Corp Events",
        "Business Solutions",
        "Conference",
        "Meetings",
        "Enterprise",
      ],
      Catering: ["Caterers", "Food Services", "Delights", "Kitchen", "Feast"],
      Photography: ["Photography", "Studios", "Captures", "Lens", "Moments"],
      Decoration: ["Decor", "Designs", "Art", "Creations", "Styling"],
      "Music & DJ": ["Beats", "Sounds", "Entertainment", "Music Co", "Rhythm"],
      Venue: ["Venues", "Lawns", "Halls", "Resorts", "Hotels"],
      "Cake Artist": ["Cakes", "Bakery", "Patisserie", "Desserts", "Sweets"],
    };

    const titles = {
      "Birthday Planner": [
        "Magical Birthday Celebrations",
        "Unforgettable Birthday Parties",
        "Theme Birthday Experts",
        "Kids Birthday Specialists",
        "Surprise Party Planners",
        "Luxury Birthday Events",
        "Entertainment Focused Parties",
        "Creative Theme Designs",
        "Complete Birthday Management",
        "Custom Celebration Packages",
      ],
      "Wedding Planner": [
        "Dream Wedding Planners",
        "Luxury Wedding Specialists",
        "Traditional & Modern Weddings",
        "Destination Wedding Experts",
        "Budget-Friendly Weddings",
        "Grand Wedding Celebrations",
        "Intimate Wedding Planning",
        "Themed Wedding Designs",
        "Complete Wedding Coordination",
        "Custom Wedding Packages",
      ],
      "Corporate Event": [
        "Professional Conference Management",
        "Corporate Party Planners",
        "Team Building Events",
        "Product Launch Specialists",
        "Annual Day Celebrations",
        "Award Ceremony Experts",
        "Corporate Gala Dinners",
        "Business Meet Coordinators",
        "Trade Show Organizers",
        "Virtual Event Specialists",
      ],
      Catering: [
        "Multi-Cuisine Catering",
        "Traditional Feast Specialists",
        "Live Food Counters",
        "Premium Catering Services",
        "Budget-Friendly Catering",
        "Corporate Catering Experts",
        "Wedding Feast Planners",
        "Theme-Based Food Stations",
        "Healthy Catering Options",
        "Gourmet Dining Experience",
      ],
      Photography: [
        "Candid Photography Experts",
        "Traditional Photography",
        "Cinematic Videography",
        "Drone Photography Specialists",
        "Pre-wedding Shoots",
        "Event Documentation",
        "Photo Booth Services",
        "Portrait Photography",
        "Album Designing Experts",
        "Same-Day Edit Specialists",
      ],
      Decoration: [
        "Elegant Decoration Designs",
        "Floral Decoration Experts",
        "Balloon Decoration Specialists",
        "Luxury Wedding Decor",
        "Birthday Theme Decorators",
        "Corporate Event Styling",
        "Lighting Design Experts",
        "Traditional & Modern Decor",
        "Custom Backdrop Designs",
        "Destination Decor Specialists",
      ],
      "Music & DJ": [
        "High-Energy DJ Performances",
        "Live Band Entertainment",
        "Classical Music Specialists",
        "Bollywood Music Experts",
        "Wedding Sangeet Planners",
        "Corporate Event DJs",
        "Ceremony Music Services",
        "Interactive Game Hosts",
        "Sound System Rental",
        "Karaoke Entertainment",
      ],
      Venue: [
        "Luxury Banquet Halls",
        "Scenic Outdoor Lawns",
        "Beach View Venues",
        "Heritage Property Venues",
        "Modern Convention Centers",
        "Rooftop Party Spaces",
        "Farmhouse Getaways",
        "Hotel Grand Ballrooms",
        "Intimate Party Halls",
        "All-inclusive Venue Packages",
      ],
      "Cake Artist": [
        "Custom Design Cakes",
        "Wedding Cake Specialists",
        "Theme Birthday Cakes",
        "Gourmet Cupcakes",
        "3D Sculpted Cakes",
        "Healthy Dessert Options",
        "Traditional Sweets Expert",
        "Fondant Art Specialists",
        "Chocolate Studio",
        "Photo Cake Designers",
      ],
    };

    // Generate providers for each service type
    for (const serviceType of serviceTypesList) {
      for (
        let i = 0;
        i <
        (serviceType === "Birthday Planner"
          ? 15
          : serviceType === "Wedding Planner"
            ? 12
            : serviceType === "Corporate Event"
              ? 10
              : serviceType === "Catering"
                ? 18
                : serviceType === "Photography"
                  ? 15
                  : serviceType === "Decoration"
                    ? 15
                    : serviceType === "Music & DJ"
                      ? 12
                      : serviceType === "Venue"
                        ? 14
                        : serviceType === "Cake Artist"
                          ? 12
                          : 10);
        i++
      ) {
        const nameIndex = i % names[serviceType].length;
        const firstName = names[serviceType][nameIndex];
        const lastName = [
          "Sharma",
          "Kumar",
          "Gupta",
          "Singh",
          "Patel",
          "Reddy",
          "Joshi",
          "Nair",
          "Verma",
          "Yadav",
        ][i % 10];
        const providerName = `${firstName} ${lastName}`;

        const suffixIndex = i % businessSuffixes[serviceType].length;
        const businessName = `${firstName}'s ${businessSuffixes[serviceType][suffixIndex]}`;

        const titleIndex = i % titles[serviceType].length;
        const title = titles[serviceType][titleIndex];

        // Distribute across states and cities
        const stateNames = Object.keys(citiesByState);
        const stateIndex = (id - 1) % stateNames.length;
        const state = stateNames[stateIndex];
        const cityList = citiesByState[state];
        const cityIndex = (id - 1) % cityList.length;
        const city = cityList[cityIndex];

        // Random area within city
        const areas = [
          "Downtown",
          "Suburb",
          "City Center",
          "North",
          "South",
          "East",
          "West",
          "Old Town",
          "New Colony",
          "Green Park",
        ];
        const area = areas[Math.floor(Math.random() * areas.length)];

        // Random pricing based on service type
        let basePrice, pricePerPerson;
        if (serviceType === "Birthday Planner") {
          basePrice = [8000, 12000, 15000, 18000, 20000, 25000, 30000][
            Math.floor(Math.random() * 7)
          ];
          pricePerPerson = [300, 400, 500, 600, 700, 800][
            Math.floor(Math.random() * 6)
          ];
        } else if (serviceType === "Wedding Planner") {
          basePrice = [50000, 75000, 100000, 125000, 150000, 200000][
            Math.floor(Math.random() * 6)
          ];
          pricePerPerson = [800, 1000, 1200, 1500, 1800, 2000][
            Math.floor(Math.random() * 6)
          ];
        } else if (serviceType === "Corporate Event") {
          basePrice = [25000, 35000, 50000, 75000, 100000, 150000][
            Math.floor(Math.random() * 6)
          ];
          pricePerPerson = [500, 700, 900, 1200, 1500][
            Math.floor(Math.random() * 5)
          ];
        } else if (serviceType === "Catering") {
          basePrice = [10000, 15000, 20000, 25000, 30000][
            Math.floor(Math.random() * 5)
          ];
          pricePerPerson = [350, 450, 550, 650, 750, 850, 950, 1050][
            Math.floor(Math.random() * 8)
          ];
        } else if (serviceType === "Photography") {
          basePrice = [5000, 8000, 10000, 12000, 15000, 18000, 20000, 25000][
            Math.floor(Math.random() * 8)
          ];
          pricePerPerson = 0;
        } else if (serviceType === "Decoration") {
          basePrice = [8000, 12000, 15000, 20000, 25000, 30000, 40000, 50000][
            Math.floor(Math.random() * 8)
          ];
          pricePerPerson = 0;
        } else if (serviceType === "Music & DJ") {
          basePrice = [8000, 10000, 12000, 15000, 18000, 20000, 25000, 30000][
            Math.floor(Math.random() * 8)
          ];
          pricePerPerson = 0;
        } else if (serviceType === "Venue") {
          basePrice = [
            20000, 30000, 40000, 50000, 75000, 100000, 125000, 150000, 200000,
          ][Math.floor(Math.random() * 9)];
          pricePerPerson = [500, 700, 900, 1100, 1300, 1500, 1800][
            Math.floor(Math.random() * 7)
          ];
        } else {
          basePrice = [1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000][
            Math.floor(Math.random() * 8)
          ];
          pricePerPerson = 0;
        }

        // Random capacity
        const capacities = [
          50, 75, 100, 150, 200, 250, 300, 400, 500, 750, 1000,
        ];
        const maxCapacity =
          capacities[Math.floor(Math.random() * capacities.length)];

        // Random rating (between 3.5 and 5.0)
        const averageRating = +(3.5 + Math.random() * 1.5).toFixed(1);

        // Random reviews (between 20 and 800)
        const totalReviews = 20 + Math.floor(Math.random() * 780);

        // Random experience
        const experiences = [
          "2+ years",
          "3+ years",
          "4+ years",
          "5+ years",
          "6+ years",
          "7+ years",
          "8+ years",
          "10+ years",
          "12+ years",
          "15+ years",
        ];
        const experience =
          experiences[Math.floor(Math.random() * experiences.length)];

        // Random projects
        const projects = 50 + Math.floor(Math.random() * 950);

        // Featured (about 20% featured)
        const featured = Math.random() < 0.2;

        // Response times
        const responseTimes = [
          "1 hour",
          "2 hours",
          "3 hours",
          "4 hours",
          "6 hours",
          "8 hours",
          "12 hours",
          "24 hours",
        ];
        const responseTime =
          responseTimes[Math.floor(Math.random() * responseTimes.length)];

        // Description based on service type
        let description = "";
        if (serviceType === "Birthday Planner") {
          description = `Complete birthday planning services including theme decoration, games, return gifts, and entertainment. We make your ${Math.random() > 0.5 ? "child's" : "family's"} birthday unforgettable! Specializing in ${["themed parties", "surprise parties", "milestone celebrations", "destination birthdays"][Math.floor(Math.random() * 4)]} with professional ${["entertainers", "coordinators", "designers", "planners"][Math.floor(Math.random() * 4)]}. Available in ${city} and surrounding areas.`;
        } else if (serviceType === "Wedding Planner") {
          description = `Complete wedding planning from engagement to reception. We specialize in ${["traditional", "modern", "fusion", "destination", "intimate"][Math.floor(Math.random() * 5)]} weddings with attention to every detail. Our team handles ${["venue selection", "catering", "decor", "entertainment", "photography"][Math.floor(Math.random() * 5)]} and more. ${Math.random() > 0.5 ? "10+ years experience in wedding coordination." : "Award-winning wedding planning services."}`;
        } else if (serviceType === "Corporate Event") {
          description = `Professional corporate event management for ${["conferences", "product launches", "annual days", "team building", "award ceremonies"][Math.floor(Math.random() * 5)]}. Complete AV setup, venue management, catering coordination, and event execution. Trusted by ${Math.random() > 0.5 ? "Fortune 500" : "leading"} companies across ${state}. End-to-end event solutions.`;
        } else if (serviceType === "Catering") {
          description = `${["Authentic", "Gourmet", "Traditional", "Fusion", "Organic", "Premium"][Math.floor(Math.random() * 6)]} catering specializing in ${["Indian", "Chinese", "Continental", "Italian", "Mughlai", "South Indian", "North Indian"][Math.floor(Math.random() * 7)]} cuisine. ${["Live counters", "Buffet setup", "Thali service", "Plated service", "Food stations"][Math.floor(Math.random() * 5)]} available. Customized menus for ${["birthdays", "weddings", "corporate events", "social gatherings"][Math.floor(Math.random() * 4)]}. Pure vegetarian and non-vegetarian options available.`;
        } else if (serviceType === "Photography") {
          description = `Professional ${["candid", "traditional", "cinematic", "fine art", "documentary"][Math.floor(Math.random() * 5)]} photography services. We capture your special moments beautifully with ${["high-end cameras", "professional lighting", "drone shots", "slow motion video"][Math.floor(Math.random() * 4)]}. Packages include ${["edited photos", "video highlights", "albums", "same-day edits"][Math.floor(Math.random() * 4)]}. ${experience} of experience in event photography.`;
        } else if (serviceType === "Decoration") {
          description = `Stunning ${["floral", "balloon", "lighting", "themed", "traditional", "modern", "luxury"][Math.floor(Math.random() * 7)]} decorations for all occasions. We create ${["magical atmospheres", "elegant settings", "vibrant parties", "romantic weddings"][Math.floor(Math.random() * 4)]} with attention to every detail. Complete setup and teardown included. ${["Fresh flowers", "LED lighting", "Custom backdrops", "Props and furniture"][Math.floor(Math.random() * 4)]} available.`;
        } else if (serviceType === "Music & DJ") {
          description = `High-energy ${["DJ", "live band", "musical", "entertainment"][Math.floor(Math.random() * 4)]} services for your event. ${["Professional sound system", "LED dance floor", "Lighting effects", "MC services"][Math.floor(Math.random() * 4)]} included. Extensive music library across ${["Bollywood", "Hollywood", "regional", "classical", "remixes"][Math.floor(Math.random() * 5)]} genres. ${["Song requests welcome", "Custom playlists", "Live mixing", "Interactive games"][Math.floor(Math.random() * 4)]}.`;
        } else if (serviceType === "Venue") {
          description = `${["Luxury", "Premium", "Budget-friendly", "Scenic", "Heritage", "Modern"][Math.floor(Math.random() * 6)]} ${["banquet hall", "lawn", "resort", "farmhouse", "convention center"][Math.floor(Math.random() * 5)]} perfect for ${["weddings", "birthdays", "corporate events", "social gatherings"][Math.floor(Math.random() * 4)]}. Amenities include ${["AC", "parking", "stage", "dance floor", "changing rooms", "catering kitchen", "décor included"][Math.floor(Math.random() * 7)]}. ${["In-house catering available", "Outside caterers allowed", "Decor included", "Complementary rooms"][Math.floor(Math.random() * 4)]}.`;
        } else {
          description = `Custom ${["design cakes", "sculpted cakes", "wedding cakes", "birthday cakes", "cupcakes", "dessert tables"][Math.floor(Math.random() * 6)]} for all occasions. ${["Fondant", "Buttercream", "Chocolate", "Fresh cream", "Sugar paste"][Math.floor(Math.random() * 5)]} expert. ${["3D designs", "Photo cakes", "Theme cakes", "Tiered cakes"][Math.floor(Math.random() * 4)]} available. ${["Eggless options", "Gluten-free", "Sugar-free", "Vegan options"][Math.floor(Math.random() * 4)]} available on request. Home delivery available in ${city}.`;
        }

        // Short description
        const shortDesc = `${
          serviceType === "Birthday Planner"
            ? `${["Professional", "Creative", "Experienced"][Math.floor(Math.random() * 3)]} birthday planners`
            : serviceType === "Wedding Planner"
              ? `${["Dream", "Luxury", "Perfect"][Math.floor(Math.random() * 3)]} wedding coordination`
              : serviceType === "Corporate Event"
                ? `${["Professional", "Reliable", "Experienced"][Math.floor(Math.random() * 3)]} corporate event managers`
                : serviceType === "Catering"
                  ? `${["Delicious", "Authentic", "Premium"][Math.floor(Math.random() * 3)]} catering services`
                  : serviceType === "Photography"
                    ? `${["Award-winning", "Creative", "Professional"][Math.floor(Math.random() * 3)]} photographers`
                    : serviceType === "Decoration"
                      ? `${["Stunning", "Creative", "Elegant"][Math.floor(Math.random() * 3)]} decoration specialists`
                      : serviceType === "Music & DJ"
                        ? `${["High-energy", "Professional", "Versatile"][Math.floor(Math.random() * 3)]} DJs & artists`
                        : serviceType === "Venue"
                          ? `${["Premium", "Beautiful", "Perfect"][Math.floor(Math.random() * 3)]} event venue`
                          : `${["Creative", "Artistic", "Talented"][Math.floor(Math.random() * 3)]} cake artists`
        } with ${experience} experience`;

        // Select image based on service type
        let image;
        switch (serviceType) {
          case "Birthday Planner":
            image = birthdayImg;
            break;
          case "Wedding Planner":
            image = weddingImg;
            break;
          case "Corporate Event":
            image = corporateImg;
            break;
          case "Catering":
            image = cateringImg;
            break;
          case "Photography":
            image = photographyImg;
            break;
          case "Decoration":
            image = decorationImg;
            break;
          case "Music & DJ":
            image = musicImg;
            break;
          case "Venue":
            image = venueImg;
            break;
          default:
            image = cakeImg;
            break;
        }

        providers.push({
          _id: id.toString(),
          providerName,
          businessName,
          serviceType,
          title,
          description,
          shortDesc,
          basePrice,
          pricePerPerson,
          city,
          area,
          state,
          maxCapacity,
          averageRating,
          totalReviews,
          images: [image],
          featured,
          experience,
          projects,
          responseTime,
          availability: Math.random() > 0.1,
        });

        id++;
      }
    }

    return providers;
  };

  const serviceProviders = generateServiceProviders();
  const cities = [...new Set(serviceProviders.map((s) => s.city))];
  const states = [...new Set(serviceProviders.map((s) => s.state))];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setServices(serviceProviders);
        setFilteredServices(serviceProviders);
        setError("");
      } catch (error) {
        console.error("Error fetching services:", error);
        setServices(serviceProviders);
        setFilteredServices(serviceProviders);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    let filtered = [...services];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (service) =>
          service.businessName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          service.providerName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          service.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.state?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedServiceType) {
      filtered = filtered.filter(
        (service) => service.serviceType === selectedServiceType,
      );
    }

    if (selectedCity) {
      filtered = filtered.filter((service) => service.city === selectedCity);
    }

    if (selectedPriceRange) {
      if (selectedPriceRange === "under-10000") {
        filtered = filtered.filter((service) => service.basePrice < 10000);
      } else if (selectedPriceRange === "10000-50000") {
        filtered = filtered.filter(
          (service) => service.basePrice >= 10000 && service.basePrice <= 50000,
        );
      } else if (selectedPriceRange === "50000-100000") {
        filtered = filtered.filter(
          (service) => service.basePrice > 50000 && service.basePrice <= 100000,
        );
      } else if (selectedPriceRange === "above-100000") {
        filtered = filtered.filter((service) => service.basePrice > 100000);
      }
    }

    if (minRating > 0) {
      filtered = filtered.filter(
        (service) => service.averageRating >= minRating,
      );
    }

    if (sortBy === "featured") {
      filtered = filtered.sort(
        (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0),
      );
    } else if (sortBy === "rating") {
      filtered = filtered.sort((a, b) => b.averageRating - a.averageRating);
    } else if (sortBy === "price-low") {
      filtered = filtered.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === "price-high") {
      filtered = filtered.sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortBy === "popular") {
      filtered = filtered.sort((a, b) => b.totalReviews - a.totalReviews);
    }

    setFilteredServices(filtered);
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedServiceType,
    selectedCity,
    selectedPriceRange,
    minRating,
    services,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedServiceType("");
    setSelectedCity("");
    setSelectedPriceRange("");
    setMinRating(0);
    setSortBy("featured");
  };

  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const totalFilters = [
    searchTerm,
    selectedServiceType,
    selectedCity,
    selectedPriceRange,
    minRating,
  ].filter(Boolean).length;

  // Pagination
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(
    indexOfFirstService,
    indexOfLastService,
  );
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading {serviceProviders.length} service providers...</p>
      </div>
    );
  }

  return (
    <div className="events-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Find Perfect Event Services</h1>
          <p className="hero-subtitle">
            Connect with {serviceProviders.length}+ top-rated professionals
            across {states.length} states
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-number">
                {serviceProviders.length}+
              </span>
              <span className="hero-stat-label">Service Providers</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">20k+</span>
              <span className="hero-stat-label">Happy Customers</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">{cities.length}+</span>
              <span className="hero-stat-label">Cities Covered</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">{states.length}</span>
              <span className="hero-stat-label">States Covered</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Service Categories */}
        <section className="categories-section">
          <h2 className="section-title">Browse by Category</h2>
          <p className="section-subtitle">
            Choose from {serviceTypes.length} professional service categories
          </p>
          <div className="categories-grid">
            {serviceTypes.map((type) => {
              const typeCount = serviceProviders.filter(
                (s) => s.serviceType === type.name,
              ).length;
              return (
                <div
                  key={type.name}
                  className={`category-card ${selectedServiceType === type.name ? "active" : ""}`}
                  onClick={() =>
                    setSelectedServiceType(
                      selectedServiceType === type.name ? "" : type.name,
                    )
                  }
                >
                  <div
                    className="category-icon"
                    style={{ backgroundColor: type.color }}
                  >
                    {type.icon}
                  </div>
                  <h3 className="category-name">{type.name}</h3>
                  <p className="category-desc">{type.description}</p>
                  <span className="category-count">{typeCount}+ Providers</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Search and Filter Bar */}
        <section className="filters-section">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by business name, service, provider, city, or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="search-clear"
                onClick={() => setSearchTerm("")}
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="filters-row">
            <select
              className="filter-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">All Cities ({cities.length})</option>
              {cities.slice(0, 50).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
            >
              <option value="">Any Price</option>
              <option value="under-10000">Under ₹10,000</option>
              <option value="10000-50000">₹10,000 - ₹50,000</option>
              <option value="50000-100000">₹50,000 - ₹1,00,000</option>
              <option value="above-100000">Above ₹1,00,000</option>
            </select>

            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="rating">Top Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>

            <button
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter /> Filters
              {totalFilters > 0 && (
                <span className="filter-badge">{totalFilters}</span>
              )}
            </button>

            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                ⊞
              </button>
              <button
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
              >
                ☰
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="advanced-filters">
              <div className="filter-group">
                <label>⭐ Minimum Rating</label>
                <div className="rating-filters">
                  {[0, 3, 3.5, 4, 4.5].map((rating) => (
                    <button
                      key={rating}
                      className={`rating-btn ${minRating === rating ? "active" : ""}`}
                      onClick={() => setMinRating(rating)}
                    >
                      {rating === 0 ? "All" : `${rating}+ Stars`}
                    </button>
                  ))}
                </div>
              </div>

              {(searchTerm ||
                selectedServiceType ||
                selectedCity ||
                selectedPriceRange ||
                minRating) && (
                <button className="clear-filters" onClick={clearFilters}>
                  <FaTimes /> Clear All Filters
                </button>
              )}
            </div>
          )}
        </section>

        {/* Results Header */}
        <div className="results-header">
          <p className="results-count">
            Found <strong>{filteredServices.length}</strong> service providers
            {filteredServices.length !== serviceProviders.length &&
              ` (from ${serviceProviders.length} total)`}
          </p>
          <p className="results-sub">
            <FaMapMarkerAlt /> Serving in {cities.length}+ cities across{" "}
            {states.length} states
          </p>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No service providers found</h3>
            <p>Try adjusting your search or filters to find more vendors</p>
            <button className="btn-primary" onClick={clearFilters}>
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div
              className={`services-grid ${viewMode === "list" ? "list-view" : ""}`}
            >
              {currentServices.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  viewMode={viewMode}
                  onWishlist={toggleWishlist}
                  isWishlisted={wishlist.includes(service._id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft /> Previous
                </button>
                <div className="page-numbers">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        className={`page-num ${currentPage === pageNum ? "active" : ""}`}
                        onClick={() => paginate(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="page-dots">...</span>
                      <button
                        className="page-num"
                        onClick={() => paginate(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                <button
                  className="page-btn"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}

        {/* CTA Banner */}
        <section className="cta-banner">
          <div className="cta-content">
            <h2>🎯 Plan Your Perfect Event</h2>
            <p>
              From birthday parties to weddings - find the best service
              providers at competitive prices across India!
            </p>
            <div className="cta-features">
              <span>
                <FaCheckCircle /> {serviceProviders.length}+ Verified Vendors
              </span>
              <span>
                <FaTrophy /> Best Price Guarantee
              </span>
              <span>
                <FaUsers /> Free Quotes
              </span>
              <span>
                <FaClock /> 24/7 Support
              </span>
              <span>
                <FaMapMarkerAlt /> {cities.length}+ Cities
              </span>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .events-page {
          min-height: 100vh;
          background: #f8f9fa;
          overflow-x: hidden;
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          height: 450px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgba(255,255,255,0.1)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"/></svg>')
            repeat-x bottom;
          background-size: cover;
          opacity: 0.3;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          color: white;
          padding: 0 20px;
          width: 100%;
        }

        .hero-title {
          font-size: 52px;
          font-weight: 800;
          margin-bottom: 16px;
          animation: fadeInUp 0.6s ease;
        }

        .hero-subtitle {
          font-size: 20px;
          margin-bottom: 40px;
          opacity: 0.9;
          animation: fadeInUp 0.6s ease 0.1s both;
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 60px;
          animation: fadeInUp 0.6s ease 0.2s both;
          flex-wrap: wrap;
        }

        .hero-stat {
          text-align: center;
        }

        .hero-stat-number {
          display: block;
          font-size: 36px;
          font-weight: 700;
        }

        .hero-stat-label {
          font-size: 14px;
          opacity: 0.8;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Categories Section */
        .categories-section {
          padding: 60px 0 40px;
        }

        .section-title {
          text-align: center;
          font-size: 36px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 16px;
        }

        .section-subtitle {
          text-align: center;
          color: #666;
          margin-bottom: 48px;
          font-size: 18px;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
        }

        .category-card {
          background: white;
          padding: 28px 20px;
          border-radius: 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
          position: relative;
          overflow: hidden;
        }

        .category-card::before {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .category-card:hover::before {
          transform: scaleX(1);
        }

        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
        }

        .category-card.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .category-card.active .category-count {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .category-icon {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          font-size: 32px;
          color: white;
        }

        .category-name {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .category-desc {
          font-size: 13px;
          opacity: 0.7;
          margin-bottom: 12px;
        }

        .category-count {
          display: inline-block;
          font-size: 12px;
          background: #f0f0f0;
          padding: 4px 12px;
          border-radius: 20px;
          color: #666;
        }

        /* Filters Section */
        .filters-section {
          background: white;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 32px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
        }

        .search-bar {
          position: relative;
          margin-bottom: 20px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
        }

        .search-bar input {
          width: 100%;
          padding: 14px 50px 14px 48px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .search-bar input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-clear {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
        }

        .filters-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-select {
          flex: 1;
          min-width: 140px;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .filter-select:focus {
          outline: none;
          border-color: #667eea;
        }

        .filter-toggle {
          padding: 12px 24px;
          background: #f5f5f5;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .filter-toggle:hover {
          background: #e0e0e0;
        }

        .filter-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #dc3545;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .view-toggle {
          display: flex;
          gap: 4px;
          background: #f5f5f5;
          border-radius: 12px;
          padding: 4px;
        }

        .view-btn {
          padding: 8px 20px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.3s ease;
        }

        .view-btn.active {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .advanced-filters {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .filter-group label {
          font-weight: 600;
          color: #333;
        }

        .rating-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .rating-btn {
          padding: 8px 20px;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .rating-btn:hover {
          border-color: #ffc107;
        }

        .rating-btn.active {
          background: #ffc107;
          border-color: #ffc107;
          color: #1a1a2e;
        }

        .clear-filters {
          padding: 10px 20px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .clear-filters:hover {
          background: #c82333;
          transform: translateY(-2px);
        }

        /* Results Header */
        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .results-count {
          font-size: 16px;
          color: #666;
        }

        .results-count strong {
          color: #1a1a2e;
          font-size: 20px;
        }

        .results-sub {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          background: #f0f0f0;
          padding: 6px 16px;
          border-radius: 30px;
        }

        /* Services Grid */
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 28px;
          margin-bottom: 60px;
        }

        .services-grid.list-view {
          grid-template-columns: 1fr;
        }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-bottom: 60px;
          flex-wrap: wrap;
        }

        .page-btn {
          padding: 10px 20px;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .page-btn:hover:not(:disabled) {
          background: #667eea;
          border-color: #667eea;
          color: white;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-numbers {
          display: flex;
          gap: 8px;
        }

        .page-num {
          width: 40px;
          height: 40px;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .page-num:hover {
          background: #667eea;
          border-color: #667eea;
          color: white;
        }

        .page-num.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          color: white;
        }

        .page-dots {
          display: flex;
          align-items: center;
          padding: 0 8px;
          color: #666;
        }

        /* No Results */
        .no-results {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 20px;
          margin-bottom: 60px;
        }

        .no-results-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }

        .no-results h3 {
          font-size: 28px;
          margin-bottom: 12px;
          color: #333;
        }

        .no-results p {
          color: #666;
          margin-bottom: 30px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 14px 40px;
          border: none;
          border-radius: 40px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        /* CTA Banner */
        .cta-banner {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 24px;
          padding: 50px;
          margin-bottom: 60px;
          text-align: center;
          color: white;
        }

        .cta-content h2 {
          font-size: 36px;
          margin-bottom: 16px;
        }

        .cta-content p {
          margin-bottom: 30px;
          opacity: 0.9;
          font-size: 18px;
        }

        .cta-features {
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
        }

        .cta-features span {
          background: rgba(255, 255, 255, 0.15);
          padding: 10px 24px;
          border-radius: 40px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(10px);
        }

        /* Loading Spinner */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 20px;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Responsive Breakpoints */
        @media (max-width: 992px) {
          .services-grid {
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            height: auto;
            padding: 80px 0;
          }

          .hero-title {
            font-size: 36px;
          }

          .hero-subtitle {
            font-size: 18px;
          }

          .hero-stats {
            gap: 30px;
            flex-wrap: wrap;
          }

          .hero-stat-number {
            font-size: 28px;
          }

          .section-title {
            font-size: 28px;
          }

          .categories-grid {
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          }

          .filters-row {
            flex-direction: column;
          }

          .filter-select,
          .filter-toggle {
            width: 100%;
          }

          .view-toggle {
            justify-content: center;
            width: 100%;
          }

          .services-grid {
            grid-template-columns: 1fr;
          }

          .cta-banner {
            padding: 40px 20px;
          }

          .cta-content h2 {
            font-size: 28px;
          }

          .cta-features {
            gap: 15px;
            flex-direction: column;
            align-items: stretch;
          }

          .cta-features span {
            justify-content: center;
          }

          .advanced-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .clear-filters {
            justify-content: center;
          }

          .pagination {
            gap: 10px;
          }

          .page-btn {
            padding: 8px 16px;
          }

          .page-num {
            width: 35px;
            height: 35px;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 0 16px;
          }

          .hero-stats {
            gap: 20px;
            flex-direction: column;
          }

          .hero-stat-number {
            font-size: 24px;
          }

          .hero-stat-label {
            font-size: 14px;
          }

          .category-card {
            padding: 20px 15px;
          }

          .category-icon {
            width: 50px;
            height: 50px;
            font-size: 24px;
          }

          .category-name {
            font-size: 16px;
          }

          .results-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .page-numbers {
            order: 1;
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

export default Events;
