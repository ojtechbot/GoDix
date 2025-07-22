// --- Global State Variables ---
let currentPage = 'login'; // 'login', 'home', 'subjectDetail', 'chapterDetail', 'quizPage', 'library', 'profile', 'settings', 'bookmarks', 'feedback'
let selectedSubject = null;
let selectedChapter = null; // Stores the entire chapter object
let currentQuiz = null; // Stores the current quiz object
let speechUtterance = null; // Reference to the current SpeechSynthesisUtterance
let isLoggedIn = false;
let currentUser = null; // Stores the full user object (username, password, settings, progress etc.)
let db = null; // IndexedDB database instance
let availableVoices = []; // To store available speech synthesis voices

// --- IndexedDB Configuration ---
const DB_NAME = 'GoDixDB';
const DB_VERSION = 2; // Increment DB version for schema changes!
const USER_STORE_NAME = 'users';

// --- DOM Element References ---
const appRoot = document.getElementById('app-root');
const appFooter = document.getElementById('app-footer');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalMessageElem = document.getElementById('modal-message');
const modalOkButton = document.getElementById('modal-ok-button');
const toastContainer = document.getElementById('toast-container');
const htmlElement = document.documentElement; // For theme/font size changes

// --- Mock Data ---
const subjects = [
    { id: 'computer-studies', title: 'Computer Studies', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-computer"><rect width="18" height="12" x="3" y="4" rx="2"/><path d="M7 20h10"/><path d="M12 16v4"/></svg>`, color: 'bg-blue-500' },
    { id: 'home-economics', title: 'Home Economics', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-utensils"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2l-4 4h4"/><path d="M17 15v7"/></svg>`, color: 'bg-green-500' },
    { id: 'social-studies', title: 'Social Studies', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20A14.5 14.5 0 0 0 12 2"/><path d="M20 12H4"/></svg>`, color: 'bg-yellow-500' },
    { id: 'health-science', title: 'Health Science', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.0 0 0 0 17.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.0 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`, color: 'bg-red-500' },
    { id: 'basic-science', title: 'Basic Science', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flask-conical"><path d="M10 16a2 2 0 0 1 4 0"/><path d="M14 16V4a2 2 0 0 0-2-2h-0.34a2 2 0 0 0-1.42.6L8.7 4.2A2 2 0 0 1 8 5.65V16"/><path d="M2 16h20"/><path d="M18 8h-4"/></svg>`, color: 'bg-purple-500' },
];

const chapters = {
    'computer-studies': [
        { title: 'Introduction to Computers', content: `<p>Computers are electronic devices that process data. They consist of hardware and software components.</p><p><strong>Hardware</strong> includes the physical parts like the Central Processing Unit (CPU), memory (RAM), and storage devices (Hard Drives, SSDs). These are the tangible components you can touch.</p><p><strong>Software</strong> refers to the programs and operating systems that tell the hardware what to do. This includes applications like web browsers, word processors, and games, as well as system software like Windows, macOS, or Linux.</p><p>Understanding how these components interact is fundamental to computer studies. The CPU executes instructions, RAM stores data temporarily for quick access, and storage devices provide long-term data persistence.</p><p>The evolution of computers has led to increasingly powerful and compact devices, from large mainframes to personal computers, laptops, tablets, and smartphones, each designed for specific user needs and environments.</p>`, quiz: [
            { question: "What are the two main components of a computer?", options: ["CPU and GPU", "Hardware and Software", "Monitor and Keyboard", "RAM and ROM"], answer: "Hardware and Software" },
            { question: "Which component stores data temporarily for quick access?", options: ["Hard Drive", "SSD", "RAM", "CPU"], answer: "RAM" }
        ]},
        { title: 'Operating Systems', content: `<p>An Operating System (OS) is system software that manages computer hardware and software resources and provides common services for computer programs. It acts as an intermediary between the user and the computer hardware.</p><p>Key functions of an OS include:</p><ul><li><strong>Memory Management:</strong> Allocating and deallocating memory for running programs.</li><li><strong>Process Management:</strong> Handling the execution of multiple programs simultaneously.</li><li><strong>File Management:</strong> Organizing and managing files and directories on storage devices.</li><li><strong>Device Management:</strong> Communicating with and controlling peripheral devices like printers and scanners.</li><li><strong>User Interface:</strong> Providing a way for users to interact with the computer (e.g., Graphical User Interface - GUI, or Command Line Interface - CLI).</li></ul><p>Popular examples of operating systems include Microsoft Windows, Apple macOS, Linux, Android (for mobile devices), and iOS (for Apple mobile devices). Each OS has its own strengths and is designed for different computing environments.</p>`, quiz: [
            { question: "What is the primary role of an Operating System?", options: ["To run video games", "To manage hardware and software resources", "To browse the internet", "To create documents"], answer: "To manage hardware and software resources" },
            { question: "Which of these is NOT a key function of an OS?", options: ["Memory Management", "File Management", "Cooking food", "Device Management"], answer: "Cooking food" }
        ]},
        { title: 'Networking Basics', content: `<p>Computer networking is a system of interconnected computers and other devices that can share resources and data. Networks enable communication and data exchange across various devices, from local area networks (LANs) in homes and offices to wide area networks (WANs) like the internet.</p><p>Fundamental concepts in networking include:</p><ul><li><strong>IP Address:</strong> A unique numerical label assigned to each device connected to a computer network that uses the Internet Protocol for communication.</li><li><strong>Protocols:</strong> Sets of rules that govern how data is transmitted and received over a network (e.g., TCP/IP, HTTP, FTP).</li><li><strong>Network Topologies:</strong> The physical or logical arrangement of connections in a network. Common topologies include:<ul><li><strong>Star:</strong> All devices connect to a central hub.</li><li><strong>Bus:</strong> All devices share a single communication line.</li><li><strong>Ring:</b> Devices are connected in a circular fashion.</li></ul></li><li><strong>Routers and Switches:</strong> Devices that direct network traffic and connect different network segments.</li></ul><p>Networking is crucial for modern communication, enabling email, web Browse, online gaming, and cloud computing.</p>`, quiz: [
            { question: "What is an IP Address?", options: ["A type of computer game", "A unique numerical label for a device on a network", "A programming language", "A type of network cable"], answer: "A unique numerical label for a device on a network" },
            { question: "Which network topology connects all devices to a central hub?", options: ["Bus", "Ring", "Star", "Mesh"], answer: "Star" }
        ]},
    ],
    'home-economics': [
        { title: 'Nutrition and Diet', content: `<p>Nutrition is the study of how food affects the body. A balanced diet is essential for maintaining good health, energy levels, and preventing chronic diseases. It involves consuming the right proportions of macronutrients and micronutrients.</p><p><strong>Macronutrients:</strong> Provide energy and are needed in large quantities.</p><ul><li><strong>Carbohydrates:</strong> Primary source of energy (e.g., grains, fruits, vegetables).</li><li><strong>Proteins:</strong> Essential for growth, repair, and maintenance of body tissues (e.g., meat, fish, beans, nuts).</li><li><strong>Fats:</strong> Provide concentrated energy, absorb vitamins, and protect organs (e.g., avocados, nuts, healthy oils).</li></ul><p><strong>Micronutrients:</strong> Vitamins and minerals, needed in smaller quantities but vital for various bodily functions (e.g., Vitamin C, Iron, Calcium).</p><p>A healthy diet emphasizes whole, unprocessed foods, adequate hydration, and moderation in sugar, salt, and unhealthy fats.</p>`, quiz: []},
        { title: 'Food Preparation', content: `<p>Food preparation involves various techniques to make food safe, palatable, and nutritious. Proper preparation methods can enhance flavor, improve digestibility, and preserve nutrients.</p><p>Key aspects of food preparation include:</p><ul><li><strong>Hygiene:</strong> Washing hands, utensils, and surfaces thoroughly to prevent cross-contamination and foodborne illnesses.</li><li><strong>Washing and Cleaning:</strong> Rinsing fruits and vegetables, and cleaning raw meat/poultry if necessary.</li><li><strong>Cutting and Chopping:</strong> Preparing ingredients into desired sizes and shapes.</li><li><strong>Cooking Methods:</strong><ul><li><strong>Boiling:</strong> Cooking in hot water (e.g., pasta, vegetables).</li><li><strong>Frying:</strong> Cooking in hot oil or fat (e.g., eggs, stir-fries).</li><li><strong>Baking/Roasting:</strong> Cooking with dry heat in an oven (e.g., bread, roasted vegetables).</li><li><strong>Steaming:</strong> Cooking with steam, preserving nutrients (e.g., fish, vegetables).</li></ul></li><li><strong>Food Storage:</strong> Proper refrigeration, freezing, and pantry storage to prevent spoilage and extend shelf life.</li></ul><p>Understanding these techniques ensures that food is not only delicious but also safe and healthy to consume.</p>`, quiz: []},
        { title: 'Household Management', content: `<p>Effective household management involves organizing tasks, budgeting, and maintaining a clean and functional living environment. It's about creating a harmonious and efficient home life for all residents.</p><p>Core components of household management include:</p><ul><li><strong>Financial Management:</strong> Creating and sticking to a budget, paying bills on time, saving money, and managing household expenses.</li><li><strong>Time Management:</strong> Scheduling daily chores, weekly cleaning tasks, and monthly maintenance activities efficiently. This often involves creating chore charts or routines.</li><li><strong>Organization:</strong> Decluttering, organizing storage spaces, and ensuring everything has its place to maintain order and reduce stress.</li><li><strong>Cleaning and Maintenance:</strong> Regular cleaning routines, performing minor repairs, and scheduling professional maintenance when needed (e.g., appliance servicing).</li><li><strong>Meal Planning:</strong> Planning meals in advance to save time and money, reduce food waste, and ensure balanced nutrition.</li></ul><p>Good household management contributes significantly to a comfortable, healthy, and stress-free living space.</p>`, quiz: []},
    ],
    'social-studies': [
        { title: 'Definition of Social Studies', content:`<p>Social Studies is learning about people, places and how we live together as families, friends and communities.</p> <h4>Big Parts of Social Studies:</h4><ul><li><strong>Who We Are:</strong> (Families, Cultures, Feelings), example is Why do some friends celebrate different holidays?</li><li><strong>Where We Live:</strong> (Houses, Schools, Countries, Maps), examples is why do some kids live in cities and others on farms?</li><li><strong>How We Work Together:</strong> (Rules, Leaders, Jobs), example is why do we raise our hands in class?</li><li><strong>Our Past & Future:</strong> (History, Inventions, Earth Care), example is how did phones change from big boxes to tiny screens?</li></ul></p><h4>Fun Examples to Explain:</h4><ul><li><strong>Like a Puzzle:</strong> Social studies connects people, places and time!</li> <li><strong>Like a Storybook:</strong> It tells tales of kings, kids and astronauts!</li><li><strong>Like a Game:</strong> Rules let everyone play fairly (just like laws!)</li></ul> <h4>5-Minute Activity:</h4> <p><strong>"Be a Social Scientist!"</strong></p><ul><li><strong>Look Around:</strong> Name 3 things in your classroom (e.g clock, flag and books)</li><li><strong>Questions:</strong> <ul><li>"Who the clock?" (History)</li><li>"Why is the flag colored this way?" (Culture)</li><li>"How do books get to our schools?" (Community helpers!)</li></ul></li></ul> <h4>Why Social Studies Matters</h4> <p><strong>Social Studies helps us</strong>: <ul><li>Understand people who seem "different".</li><li>Solve problems (like sharing cleaning parks).</li><li>Dream up better futures (like becoming teachers or astronauts!).</li></ul>`, quiz: []},
        { title: 'Culture, Money And Leadership', content:`<h3>What is Culture?</h3><p>The way a group of people live, celebrate and share traditions.</p><p><strong>Examples:</strong></p><ul><li><strong>Food:</strong> Italians eat pasta, japanese eat sushi.</li><li><strong>Clothing:</strong> Scots wear kits, Idians wear saris.</li><li><strong>Celebrations:</strong> Mexicans have pinatas, Chinese celebrate Lunar New Year.</li></ul> <h3>What is Money?</h3> <p>Coins, paper or digital numbers we trade(exchange) for things we need or want.</p><h4>Types & Uses:</h4><ul><li><strong>Coins/bills:</strong> Buy ice cream (100 Naira) and toys (1000 Naira).</li><li><strong>Bank Cards:</strong> Magic plastic that holds digital money!</li><li><strong>Savings/Spending:</strong> <ul><li>save: Piggy bank for a bicycle.</li> <li>Spend: Buying a comic book today.</li></ul></li></ul> <h3>What is Famous Leadership?</h3> <p>When someone inspires many people to make big changes</p> <p><strong>Heroes & What they Did:</strong></p><table><tr><th>Leader</th><th>What They Did</th></tr><tr><td><strong>Martin Luther King Jr.</strong></td><td>Used peaceful speeches to fight unfairness.</td></tr><tr><td><strong>Malala</strong></td><td>Demanded girl's right to go to school.</td></tr><tr><td><strong>Nelson Mandela</strong></td><td>Ended unfair rule in South Africa</td></tr></table> <p><strong>Let us disccuss now:</strong> <br> "If you were a lader for a day, what unfar thing would you fix?"</p> <h3>What is Leadership?</h3> <p>Helping others work together nicely (like a team captain!).</p><h4>How to Be a Leader:</h4> <ul><li><strong>Listen:</strong> (Hear friend's ideas)</li><li><strong>Share:</strong> (Take turns beeing like leader).</li><li><strong>Solve Problems</strong> (Stop fights with words, not pushing).</li></ul> <h3>What is Descipline?</h3> <p>choosing to do the right thing, even when no one is watching</p> <p><strong>examples:</strong> <ul><li><strong>At School:</strong> Raising your hand instead of shouting.</li><li><strong>At Home:</strong> Brushing teeth before bed (even if tired!).</li><li><strong>With Friends:</strong> Sharing swings without being told.</li></ul> <p><strong>Golden Rule:</strong> <br>"Discipline = freedom! (Rules help everyone have fun safely.)</p> <p><strong>Question:</strong> <br>"What would you do?" <ul><li>Scenario: Your friend cheats in a game. Do you: <br> A) yell at them, or <br> B) Say, "Let's play fair next time!"</li></ul> <h4>Why These Matters:</h4> <ul><li><strong>Culture:</strong> Teaches us to respect difference.</li> <li><strong>Money:</strong> Helps us make smart choices.</li> <li><strong>Leadership:</strong> Makes the world fairer.</li> <li><strong>Discipline:</strong> Makes life happier for evryone!</li></ul>`, quiz: [
        { question: "A god leader does what?", options: ["Shares toys with friends", "Always wants to go first", "Ignores others ideas"], answer: "Shares toys with friends"},
        { question: "Money is used to do what?", options: ["Buy ice cream and books", "Plant trees", "Make the sun shine"], answer: "Buy ice cream and books"},
        { question: "Culture includes", options: ["Food, clothes and holidays", "Only weather", "Math equations"], answer: "Food, clothes and holidays"},
        { question: "Discipline means?", options: ["Doing what you want, anytime", "Following rules to stay safe and happy", "Fighting with your friends", "Following rules to stay safe and happy"], answer: "Following rules to stay safe and happy"}]},
        { title: 'Civics and Government', content: `<p>Civics is the study of the rights and duties of citizenship. It explores the structure and function of government, the electoral process, and the role of citizens in a democratic society.</p><p>Key concepts in civics include:</p><ul><li><strong>Citizenship:</strong> The legal status of being a member of a country, with associated rights (e.g., voting, freedom of speech) and responsibilities (e.g., obeying laws, paying taxes).</li><li><strong>Forms of Government:</strong> Different ways countries are governed, such as:<ul><li><strong>Democracy:</strong> Citizens hold power, typically through elected representatives.</li><li><strong><strong>Monarchy:</strong> Ruled by a single head (king/queen), often hereditary.</strong></li><li><strong>Republic:</strong> Power held by elected officials and representatives.</li><li><strong>Dictatorship:</strong> Ruled by a single person or small group with absolute power.</li></ul></li><li><strong>Branches of Government:</strong> In many democracies, government power is divided into:<ul><li><strong>Legislative:</strong> Makes laws (e.g., Parliament, Congress).</li><li><strong>Executive:</strong> Implements and enforces laws (e.g., President, Prime Minister).</li><li><strong>Judicial:</strong> Interprets laws (e.g., Courts).</li></ul></li></ul><p>Understanding civic responsibilities and how government functions is vital for active and informed participation in society.</p>`, quiz: []},
        { title: 'History of Civilizations', content: `<p>The history of civilizations traces the development of human societies from ancient times to the present. It encompasses the rise and fall of empires, cultural achievements, political systems, economic structures, and social developments across different continents.</p><p>Major ancient civilizations often studied include:</p><ul><li><strong>Mesopotamia (Sumer, Akkad, Babylon):</strong> Known for the invention of writing (cuneiform), early legal codes (Code of Hammurabi), and monumental architecture (ziggurats).</li><li><strong>Ancient Egypt:</strong> Famous for its pharaohs, pyramids, hieroglyphs, and advanced understanding of medicine and astronomy.</li><li><strong>Indus Valley Civilization:</strong> Characterized by well-planned cities (Harappa, Mohenjo-Daro) and sophisticated urban planning.</li><li><strong>Ancient China:</strong> Developed unique philosophies (Confucianism, Taoism), advanced metallurgy, and the Great Wall.</li><li><strong>Ancient Greece:</strong> Birthplace of democracy, philosophy (Socrates, Plato, Aristotle), epic poetry (Homer), and classical architecture.</li><li><strong>Ancient Rome:</strong> Known for its vast empire, legal system, engineering feats (aqueducts, roads), and military prowess.</li></ul><p>Studying these civilizations provides insight into the foundations of modern societies, cultures, and governance.</p>`, quiz: []},
        { title: 'Geography and Environment', content: `<p>Geography is the study of the Earth's physical features and atmosphere, and human activity as it affects and is affected by these. It's a broad field that connects natural sciences with social sciences.</p><p>Key areas of study in geography include:</p><ul><li><strong>Physical Geography:</strong> Focuses on natural features like landforms (mountains, rivers, deserts), climate zones, ecosystems (forests, oceans), and natural processes (volcanoes, earthquakes).</li><li><strong>Human Geography:</strong> Examines the distribution and characteristics of human populations, cultures, economies, and political systems across the Earth's surface. This includes topics like urbanization, migration, and cultural landscapes.</li><li><strong>Environmental Geography:</strong> Explores the interactions between humans and the natural environment, including issues like climate change, pollution, resource management, and sustainability.</li></ul><p>Tools used by geographers include maps, Geographic Information Systems (GIS), remote sensing, and statistical analysis. Understanding geography is crucial for addressing global challenges like climate change, resource scarcity, and sustainable development.</p>`, quiz: []},
    ],
    'health-science': [
        { title: 'Human Anatomy', content: `<p>Human anatomy is the scientific study of the body's structures. It explores the organization of cells, tissues, organs, and organ systems, providing the foundational knowledge for understanding how the human body works.</p><p>The human body is organized into several major organ systems:</p><ul><li><strong>Skeletal System:</strong> Provides support, protection, and movement (bones, cartilage, ligaments).</li><li><strong>Muscular System:</strong> Enables movement and maintains posture (muscles, tendons).</li><li><strong>Circulatory System:</strong> Transports blood, nutrients, oxygen, and waste (heart, blood vessels, blood).</li><li><strong>Nervous System:</strong> Controls and coordinates body functions, processes sensory information (brain, spinal cord, nerves).</li><li><strong>Respiratory System:</strong> Facilitates gas exchange (lungs, airways).</li><li><strong>Digestive System:</strong> Breaks down food and absorbs nutrients (stomach, intestines, liver, pancreas).</li><li><strong>Endocrine System:</strong> Produces hormones that regulate various bodily functions (glands like thyroid, adrenal).</li><li><strong>Reproductive System:</strong> Responsible for reproduction.</li><li><strong>Integumentary System:</strong> Protects the body (skin, hair, nails).</li><li><strong>Urinary System:</strong> Filters waste from blood (kidneys, bladder).</li><li><strong>Lymphatic/Immune System:</strong> Defends against disease (lymph nodes, spleen, white blood cells).</li></ul><p>Understanding anatomy is fundamental to all health sciences, from medicine to physical therapy and nursing.</p>`, quiz: []},
        { title: 'Disease Prevention', content: `<p>Disease prevention focuses on strategies to reduce the risk of illness and promote overall well-being. It's about proactive measures to avoid health problems before they start or worsen.</p><p>Key approaches to disease prevention include:</p><ul><li><strong>Vaccinations:</strong> Immunizing against infectious diseases (e.g., measles, flu, polio).</li><li><strong>Maintaining Hygiene:</strong> Regular handwashing, proper food handling, and sanitation to prevent the spread of germs.</li><li><strong>Adopting Healthy Lifestyles:</strong><ul><li><strong>Balanced Diet:</strong> Consuming nutritious foods and avoiding excessive sugar, unhealthy fats, and processed foods.</li><li><strong>Regular Physical Activity:</strong> Engaging in exercise to maintain a healthy weight, improve cardiovascular health, and boost mood.</li><li><strong>Adequate Sleep:</strong> Ensuring sufficient rest for physical and mental recovery.</li><li><strong>Stress Management:</strong> Practicing techniques like meditation, yoga, or hobbies to reduce stress levels.</li></ul></li><li><strong>Regular Check-ups and Screenings:</strong> Visiting healthcare professionals for routine examinations and tests to detect potential health issues early.</li><li><strong>Avoiding Harmful Substances:</strong> Limiting or avoiding tobacco, excessive alcohol, and illicit drugs.</li></ul><p>By implementing these preventive measures, individuals can significantly reduce their risk of developing many common diseases and improve their quality of life.</p>`, quiz: []},
        { title: 'First Aid Basics', content: `<p>First aid involves immediate care given to an injured or ill person before professional medical help arrives. The goal is to preserve life, prevent the condition from worsening, and promote recovery.</p><p>General principles of first aid:</p><ul><li><strong>Assess the Situation:</strong> Ensure the scene is safe for both the rescuer and the victim. Identify the nature of the injury or illness.</li><li><strong>Call for Help:</strong> Dial emergency services (e.g., 911, 112, 999) as soon as possible, providing clear and concise information.</li><li><strong>Provide Basic Interventions:</strong><ul><li><strong>Bleeding:</strong> Apply direct pressure to the wound with a clean cloth.</li><li><strong>Choking:</strong> Perform abdominal thrusts (Heimlich maneuver) if the person is conscious and unable to breathe or speak.</li><li><strong>Burns:</strong> Cool the burn with cool (not cold) running water for at least 10 minutes.</li><li><strong>Fractures/Sprains:</strong> Immobilize the injured area, apply ice, and elevate if possible.</li><li><strong>CPR (Cardiopulmonary Resuscitation):</strong> If the person is unconscious and not breathing, perform chest compressions and rescue breaths (if trained).</li></ul></li><li><strong>Comfort and Reassure:</strong> Keep the victim calm and warm.</li><li><strong>Do Not Move Unnecessarily:</strong> Especially if there's a suspected head, neck, or spinal injury.</li></ul><p>Basic first aid knowledge can make a critical difference in an emergency, potentially saving a life or preventing long-term complications.</p>`, quiz: []},
    ],
    'basic-science': [
        { title: 'States of Matter', content: `<p>Matter is anything that has mass and takes up space. It exists in different states, primarily solid, liquid, and gas, with plasma being another important state found in stars and lightning.</p><ul><li><strong>Solid:</strong> Has a definite shape and a definite volume. Particles are tightly packed in a fixed arrangement and vibrate in place (e.g., ice, rock, wood).</li><li><strong>Liquid:</strong> Has a definite volume but no definite shape; it takes the shape of its container. Particles are close together but can slide past each other (e.g., water, oil, milk).</li><li><strong>Gas:</strong> Has neither a definite shape nor a definite volume; it expands to fill its container. Particles are far apart and move randomly and rapidly (e.g., air, oxygen, steam).</li><li><strong>Plasma:</strong> An ionized gas, consisting of positive ions and free electrons. It is the most common state of matter in the universe, found in stars, lightning, and neon signs.</li></ul><p>Transitions between these states (e.g., melting, freezing, evaporation, condensation) occur when energy (usually heat) is added or removed from the substance.</p>`, quiz: []},
        { title: 'Energy and Motion', content: `<p><strong>Energy</strong> is the capacity to do work. It is a fundamental concept in physics and exists in various forms, which can be converted from one to another but never created or destroyed (Law of Conservation of Energy).</p><p>Common forms of energy include:</p><ul><li><strong>Kinetic Energy:</strong> Energy of motion (e.g., a moving car, flowing water).</li><li><strong>Potential Energy:</strong> Stored energy due to position or state (e.g., a ball at the top of a hill, a stretched spring).</li><li><strong>Thermal Energy:</strong> Energy associated with the random motion of atoms and molecules (heat).</li><li><strong>Chemical Energy:</strong> Stored in the bonds of chemical compounds (e.g., food, batteries).</li><li><strong>Electrical Energy:</strong> Associated with the flow of electric charge.</li><li><strong>Nuclear Energy:</strong> Stored in the nucleus of atoms.</li></ul><p><strong>Motion</strong> describes the change in position of an object over time. It is influenced by forces and governed by Newton's Laws of Motion:</p><ul><li><strong>Newton's First Law (Inertia):</strong> An object at rest stays at rest, and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.</li><li><strong>Newton's Second Law (F=ma):</strong> The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.</li><li><strong>Newton's Third Law (Action-Reaction):</strong> For every action, there is an equal and opposite reaction.</li></ul><p>Understanding energy and motion is crucial for explaining phenomena from the movement of planets to the operation of machines.</p>`, quiz: []},
        { title: 'The Water Cycle', content: `<p>The water cycle, also known as the hydrological cycle, describes the continuous movement of water on, above, and below the surface of the Earth. It is a vital process for sustaining life and regulating Earth's climate.</p><p>The main stages of the water cycle are:</p><ul><li><strong>Evaporation:</strong> The process by which water changes from a liquid to a gas (water vapor) and rises into the atmosphere, primarily from oceans, lakes, and rivers, driven by the sun's energy.</li><li><strong>Transpiration:</strong> The process by which moisture is carried through plants from roots to small pores on the underside of leaves, where it changes to vapor and is released to the atmosphere.</li><li><strong>Condensation:</strong> As water vapor rises, it cools and changes back into tiny liquid water droplets or ice crystals, forming clouds.</li><li><strong>Precipitation:</strong> When water droplets or ice crystals in clouds become too heavy, they fall back to Earth as rain, snow, sleet, or hail.</li><li><strong>Collection/Runoff:</strong> Once precipitation reaches the ground, it can either soak into the ground (infiltration), flow over the surface as runoff into rivers, lakes, and oceans, or be stored as ice and snow.</li></ul><p>The water cycle is a closed system, meaning the total amount of water on Earth remains constant, continuously cycling through these processes.</p>`, quiz: []},
    ],
};

// --- IndexedDB Functions ---

/**
 * Opens the IndexedDB database.
 * Handles schema upgrades for new versions.
 * @returns {Promise<IDBDatabase>} A promise that resolves with the database instance.
 */
function openGoDixDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            // Old version value is `event.oldVersion`
            // New version value is `event.newVersion`

            if (event.oldVersion < 1) { // Initial creation or upgrade from no version
                if (!db.objectStoreNames.contains(USER_STORE_NAME)) {
                    const userStore = db.createObjectStore(USER_STORE_NAME, { keyPath: 'username' });
                    // Add default user if not exists
                    userStore.add({
                        username: 'jan', // Default user
                        password: 'password',
                        settings: {
                            speechVoice: 'Google US English',
                            speechRate: 1.0,
                            darkMode: false, // Default to light mode
                            fontSize: 'medium', // Default font size
                            highContrast: false, // Default high contrast
                        },
                        chaptersCompleted: {}, // {subjectId: {chapterTitle: true, ...}}
                        bookmarkedChapters: [], // [{subjectId, chapterTitle}, ...]
                        lastViewedSubject: null,
                        notes: {}, // {subjectId: {chapterTitle: "Your note here", ...}}
                    });
                }
            }

            if (event.oldVersion < 2) { // Upgrade from v1 to v2
                // Ensure the user store exists and has the new fields
                const userStore = request.transaction.objectStore(USER_STORE_NAME);

                // Iterate over existing users to add new fields with default values
                userStore.openCursor().onsuccess = function(e) {
                    const cursor = e.target.result;
                    if (cursor) {
                        const user = cursor.value;
                        if (!user.settings) {
                            user.settings = {};
                        }
                        user.settings.darkMode = user.settings.darkMode ?? false;
                        user.settings.fontSize = user.settings.fontSize ?? 'medium';
                        user.settings.highContrast = user.settings.highContrast ?? false;
                        user.chaptersCompleted = user.chaptersCompleted ?? {};
                        user.bookmarkedChapters = user.bookmarkedChapters ?? [];
                        user.notes = user.notes ?? {};
                        cursor.update(user);
                        cursor.continue();
                    }
                };
                console.log('IndexedDB schema upgraded to version 2.');
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.errorCode, event.target.error);
            showToast('Failed to open database.', 'error');
            reject(event.target.error);
        };
    });
}

/**
 * Saves user data to IndexedDB.
 * @param {Object} user - The user object to save (must contain a 'username' key, and can include 'password', 'settings').
 * @returns {Promise<void>} A promise that resolves when data is saved.
 */
function saveUserData(user) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('Database not open.');
            return;
        }
        const transaction = db.transaction([USER_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(USER_STORE_NAME);
        const request = store.put(user); // Use put to add or update

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = (event) => {
            console.error('Error saving user data:', event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Retrieves user data from IndexedDB by username.
 * @param {string} username - The username to retrieve.
 * @returns {Promise<Object|undefined>} A promise that resolves with the user object or undefined if not found.
 */
function getUserData(username) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('Database not open.');
            return;
        }
        const transaction = db.transaction([USER_STORE_NAME], 'readonly');
        const store = transaction.objectStore(USER_STORE_NAME);
        const request = store.get(username);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = (event) => {
            console.error('Error getting user data:', event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Clears all user data from the IndexedDB.
 * @returns {Promise<void>} A promise that resolves when the store is cleared.
 */
function clearAllUserData() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('Database not open.');
            return;
        }
        const transaction = db.transaction([USER_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(USER_STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = (event) => {
            console.error('Error clearing user data:', event.target.error);
            reject(event.target.error);
        };
    });
}

// --- Theme & Font Size Functions ---
function applyUserSettings() {
    if (currentUser) {
        // Apply Dark Mode
        htmlElement.dataset.theme = currentUser.settings.darkMode ? 'dark' : 'light';
        // Apply Font Size
        htmlElement.dataset.fontSize = currentUser.settings.fontSize || 'medium';
        // Apply High Contrast
        htmlElement.dataset.highContrast = currentUser.settings.highContrast ? 'true' : 'false';
    }
}

async function toggleDarkMode() {
    if (!currentUser) return;
    currentUser.settings.darkMode = !currentUser.settings.darkMode;
    await saveUserData(currentUser);
    applyUserSettings();
    showToast(currentUser.settings.darkMode ? 'Dark Mode On' : 'Dark Mode Off', 'info');
}

async function setFontSize(size) {
    if (!currentUser) return;
    currentUser.settings.fontSize = size;
    await saveUserData(currentUser);
    applyUserSettings();
    showToast(`Font size set to ${size}.`, 'info');
}

async function toggleHighContrast() {
    if (!currentUser) return;
    currentUser.settings.highContrast = !currentUser.settings.highContrast;
    await saveUserData(currentUser);
    applyUserSettings();
    showToast(currentUser.settings.highContrast ? 'High Contrast On' : 'High Contrast Off', 'info');
}


// --- Toast Notification Functions ---
function showToast(message, type = 'info', duration = 3000) {
    const toastElement = document.createElement('div');
    const baseClasses = 'p-4 rounded-lg shadow-lg text-white font-semibold flex items-center justify-between transition-all duration-300 ease-out transform';
    let typeClasses = '';
    let iconSvg = '';

    switch (type) {
        case 'success':
            typeClasses = 'bg-green-500';
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle mr-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-8.5"/><path d="m9 11 3 3L22 4"/></svg>`;
            break;
        case 'error':
            typeClasses = 'bg-red-500';
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-circle mr-2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`;
            break;
        case 'info':
        default:
            typeClasses = 'bg-blue-500';
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info mr-2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;
            break;
    }

    toastElement.className = `${baseClasses} ${typeClasses} toast-enter`;
    toastElement.innerHTML = `
        ${iconSvg}
        <span>${message}</span>
        <button class="ml-4 text-white opacity-75 hover:opacity-100 focus:outline-none" aria-label="Close toast">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
    `;

    toastContainer.prepend(toastElement); // Prepend to show new toasts at the top

    requestAnimationFrame(() => {
        toastElement.classList.remove('toast-enter');
        toastElement.classList.add('toast-enter-active');
    });

    const timeoutId = setTimeout(() => {
        removeToast(toastElement);
    }, duration);

    toastElement.querySelector('button').addEventListener('click', () => {
        clearTimeout(timeoutId);
        removeToast(toastElement);
    });
}

/**
 * Removes a toast notification with an exit animation.
 * @param {HTMLElement} toastElement - The toast element to remove.
 */
function removeToast(toastElement) {
    toastElement.classList.remove('toast-enter-active');
    toastElement.classList.add('toast-exit-active');

    toastElement.addEventListener('transitionend', () => {
        toastElement.remove();
    }, { once: true });
}


// --- Speech Synthesis Functions ---
function showMessageBox(message) {
    modalMessageElem.innerHTML = message;
    modalBackdrop.classList.remove('hidden');
}

function hideMessageBox() {
    modalBackdrop.classList.add('hidden');
}

function speakText(text) {
    if (!('speechSynthesis' in window)) {
        showMessageBox("Speech synthesis is not supported in this browser.");
        return;
    }

    if (speechUtterance) {
        window.speechSynthesis.cancel();
    }
    speechUtterance = new SpeechSynthesisUtterance(text);

    const preferredVoiceName = currentUser?.settings?.speechVoice;
    if (preferredVoiceName) {
        const voice = availableVoices.find(v => v.name === preferredVoiceName);
        if (voice) {
            speechUtterance.voice = voice;
        } else {
            console.warn(`Preferred voice "${preferredVoiceName}" not found, using default.`);
            const femaleVoice = availableVoices.find(v => v.name.includes('female') || v.name.includes('Female') || (v.lang.startsWith('en') && v.name.includes('Google') && v.name.includes('US')));
            if (femaleVoice) {
                speechUtterance.voice = femaleVoice;
            }
        }
    } else {
        const femaleVoice = availableVoices.find(v => v.name.includes('female') || v.name.includes('Female') || (v.lang.startsWith('en') && v.name.includes('Google') && v.name.includes('US')));
        if (femaleVoice) {
            speechUtterance.voice = femaleVoice;
        }
    }

    speechUtterance.rate = currentUser?.settings?.speechRate || 1.0;
    speechUtterance.pitch = 1.0;

    window.speechSynthesis.speak(speechUtterance);
}

function stopSpeech() {
    if ('speechSynthesis' in window && speechUtterance) {
        window.speechSynthesis.cancel();
        speechUtterance = null;
    }
}

// --- Greeting Function ---
function greetUser() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let greeting;
    if (hours < 12) {
        greeting = "Good morning";
    } else if (hours < 18) {
        greeting = "Good afternoon";
    } else {
        greeting = "Good evening";
    }

    const greetingText = `${greeting}, ${currentUser ? currentUser.username : 'Jan'}! The current time is ${timeString}. Welcome to GoDix!`;
    speakText(greetingText);
}

// --- Authentication Functions ---
async function handleLogin(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const username = usernameInput.value;
    const password = passwordInput.value;

    try {
        const user = await getUserData(username);
        if (user && user.password === password) {
            isLoggedIn = true;
            currentUser = user; // Set the current user object
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('lastLoggedInUser', username);
            applyUserSettings(); // Apply settings on login
            showToast('Login successful! Welcome, ' + username + '.', 'success');
            navigateTo('home');
        } else {
            showToast('Invalid username or password.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('An error occurred during login.', 'error');
    }
}

async function handleSignup(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
        showToast('Username and password cannot be empty.', 'error');
        return;
    }

    try {
        const existingUser = await getUserData(username);
        if (existingUser) {
            showToast('Username already exists. Please choose a different one.', 'error');
            return;
        }

        // Save new user with default settings and empty progress/bookmarks
        const newUser = {
            username: username,
            password: password,
            settings: {
                speechVoice: 'Google US English', // Default voice
                speechRate: 1.0,
                darkMode: false,
                fontSize: 'medium',
                highContrast: false,
            },
            chaptersCompleted: {}, // {subjectId: {chapterTitle: true}}
            bookmarkedChapters: [], // [{subjectId, chapterTitle}]
            lastViewedSubject: null,
            notes: {}, // {subjectId: {chapterTitle: "Your note here"}}
        };
        await saveUserData(newUser);
        showToast('Signup successful! You can now log in.', 'success');
        currentPage = 'login';
        renderPage();
    } catch (error) {
        console.error('Signup error:', error);
        showToast('An error occurred during signup.', 'error');
    }
}

function handleLogout() {
    stopSpeech();
    isLoggedIn = false;
    currentUser = null; // Clear current user
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('lastLoggedInUser');
    htmlElement.dataset.theme = 'light'; // Reset theme on logout
    htmlElement.dataset.fontSize = 'medium'; // Reset font size
    htmlElement.dataset.highContrast = 'false'; // Reset high contrast
    showToast('You have been logged out.', 'info');
    navigateTo('login');
}

// --- Navigation Logic ---
function navigateTo(page, data = null) {
    stopSpeech(); // Stop any ongoing speech before navigating
    appRoot.classList.add('opacity-0', 'transition-opacity', 'duration-300'); // Fade out

    setTimeout(() => { // Wait for fade out
        currentPage = page;

        // Trigger ad logic on navigation (but not on login/logout/quiz pages)
        if (page !== 'login' && page !== 'signup' && page !== 'quizPage' && page !== 'feedback') {
            triggerAdOnNavigation();
        }

        switch (page) {
            case 'home':
                selectedSubject = null;
                selectedChapter = null;
                currentQuiz = null;
                break;
            case 'subjectDetail':
                selectedSubject = data; // data is the subject object
                selectedChapter = null;
                currentQuiz = null;
                // Update last viewed subject for current user
                if (currentUser && selectedSubject) {
                    currentUser.lastViewedSubject = selectedSubject.title;
                    saveUserData(currentUser).catch(e => console.error("Failed to save last viewed subject:", e));
                }
                break;
            case 'chapterDetail':
                selectedChapter = data; // data is the chapter object
                currentQuiz = null;
                break;
            case 'quizPage':
                currentQuiz = data; // data is the chapter object for which quiz is taken
                break;
            case 'library':
            case 'profile':
            case 'settings':
            case 'bookmarks':
            case 'feedback':
                selectedSubject = null;
                selectedChapter = null;
                currentQuiz = null;
                break;
            default:
                break;
        }
        renderPage();
        updateFooterVisibility();
        updateFooterActiveState();
        appRoot.classList.remove('opacity-0'); // Fade in
    }, 300); // Duration of fade-out transition
}

function handleSubjectClick(subjectId) {
    const subject = subjects.find(s => s.id === subjectId);
    if (subject) {
        navigateTo('subjectDetail', subject);
        speakText(subject.title);
    }
}

function handleReadChapter(subjectId, chapterTitle) {
    const chapter = chapters[subjectId].find(c => c.title === chapterTitle);
    if (chapter) {
        navigateTo('chapterDetail', { subjectId: subjectId, ...chapter });
        speakText(chapter.content);
    }
}

// --- Chapter Progress & Bookmark Functions ---
async function markChapterComplete(subjectId, chapterTitle) {
    if (!currentUser) return;
    if (!currentUser.chaptersCompleted[subjectId]) {
        currentUser.chaptersCompleted[subjectId] = {};
    }
    currentUser.chaptersCompleted[subjectId][chapterTitle] = true;
    await saveUserData(currentUser);
    showToast(`"${chapterTitle}" marked as complete!`, 'success');
    renderSubjectDetailPage(); // Re-render to update progress
}

function isChapterComplete(subjectId, chapterTitle) {
    if (!currentUser || !currentUser.chaptersCompleted[subjectId]) {
        return false;
    }
    return !!currentUser.chaptersCompleted[subjectId][chapterTitle];
}

async function toggleBookmark(subjectId, chapterTitle) {
    if (!currentUser) return;
    const bookmarkIndex = currentUser.bookmarkedChapters.findIndex(
        b => b.subjectId === subjectId && b.chapterTitle === chapterTitle
    );

    if (bookmarkIndex === -1) {
        currentUser.bookmarkedChapters.push({ subjectId, chapterTitle });
        showToast(`"${chapterTitle}" bookmarked!`, 'success');
    } else {
        currentUser.bookmarkedChapters.splice(bookmarkIndex, 1);
        showToast(`Bookmark removed for "${chapterTitle}".`, 'info');
    }
    await saveUserData(currentUser);
    renderChapterPage(); // Re-render to update bookmark icon
}

function isChapterBookmarked(subjectId, chapterTitle) {
    if (!currentUser) return false;
    return currentUser.bookmarkedChapters.some(
        b => b.subjectId === subjectId && b.chapterTitle === chapterTitle
    );
}

async function saveChapterNote(subjectId, chapterTitle, noteContent) {
    if (!currentUser) return;
    if (!currentUser.notes[subjectId]) {
        currentUser.notes[subjectId] = {};
    }
    currentUser.notes[subjectId][chapterTitle] = noteContent;
    await saveUserData(currentUser);
    showToast('Note saved!', 'success');
}

function getChapterNote(subjectId, chapterTitle) {
    if (!currentUser || !currentUser.notes[subjectId]) {
        return '';
    }
    return currentUser.notes[subjectId][chapterTitle] || '';
}


// --- Rendering Functions ---
function renderAuthPage() {
    const isLoginMode = currentPage === 'login';
    appRoot.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 p-4">
            <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm transform transition-all duration-300 hover:scale-105">
                <h2 class="text-3xl font-extrabold text-center text-gray-900 mb-8">
                    ${isLoginMode ? 'Welcome to GoDix' : 'Join GoDix'}
                </h2>
                <form id="auth-form" class="space-y-6">
                    <div>
                        <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                            placeholder="jan"
                            required
                        />
                    </div>
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                            placeholder="password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        class="w-full bg-purple-700 text-white py-3 rounded-lg font-semibold text-lg hover:bg-purple-800 transition duration-300 shadow-lg transform hover:-translate-y-1"
                    >
                        ${isLoginMode ? 'Login' : 'Sign Up'}
                    </button>
                </form>
                <div class="mt-6 text-center">
                    ${isLoginMode ? `
                        <p class="text-gray-600">
                            Don't have an account?
                            <button id="switch-to-signup" class="text-purple-700 font-medium hover:underline focus:outline-none">
                                Sign Up
                            </button>
                        </p>
                    ` : `
                        <p class="text-gray-600">
                            Already have an account?
                            <button id="switch-to-login" class="text-purple-700 font-medium hover:underline focus:outline-none">
                                Login
                            </button>
                        </p>
                    `}
                </div>
            </div>
        </div>
    `;
    // Attach event listeners after content is rendered
    document.getElementById('auth-form').addEventListener('submit', isLoginMode ? handleLogin : handleSignup);
    if (isLoginMode) {
        document.getElementById('switch-to-signup').addEventListener('click', () => { currentPage = 'signup'; renderPage(); });
    } else {
        document.getElementById('switch-to-login').addEventListener('click', () => { currentPage = 'login'; renderPage(); });
    }
}

function renderHomePage() {
    appRoot.innerHTML = `
        <div class="flex flex-col items-center p-4 min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 pb-20">
            <h1 class="text-4xl font-extrabold text-gray-900 mt-8 mb-10 text-center leading-tight">
                Choose Your Subject
            </h1>
            <div class="w-full max-w-lg mb-8">
                <input type="text" id="subject-search-input" placeholder="Search subjects..." class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-purple-500 focus:border-purple-500 transition duration-200 shadow-md">
            </div>
            <div id="subject-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full max-w-6xl">
                ${subjects.map(subject => `
                    <button
                        data-subject-id="${subject.id}"
                        class="subject-card flex flex-col items-center justify-center p-6 ${subject.color} text-white rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-${subject.color.split('-')[1]}-400"
                    >
                        ${subject.icon}
                        <span class="text-lg font-semibold text-center mt-4">${subject.title}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    // Attach event listeners using delegation
    appRoot.querySelectorAll('.subject-card').forEach(button => {
        button.addEventListener('click', (event) => {
            const subjectId = event.currentTarget.dataset.subjectId;
            handleSubjectClick(subjectId);
        });
    });

    const searchInput = document.getElementById('subject-search-input');
    searchInput.addEventListener('input', (event) => {
        const query = event.target.value.toLowerCase();
        const filteredSubjects = subjects.filter(subject =>
            subject.title.toLowerCase().includes(query)
        );
        const subjectGrid = document.getElementById('subject-grid');
        subjectGrid.innerHTML = filteredSubjects.map(subject => `
            <button
                data-subject-id="${subject.id}"
                class="subject-card flex flex-col items-center justify-center p-6 ${subject.color} text-white rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-${subject.color.split('-')[1]}-400"
            >
                ${subject.icon}
                <span class="text-lg font-semibold text-center mt-4">${subject.title}</span>
            </button>
        `).join('');
        subjectGrid.querySelectorAll('.subject-card').forEach(button => {
            button.addEventListener('click', (event) => {
                const subjectId = event.currentTarget.dataset.subjectId;
                handleSubjectClick(subjectId);
            });
        });
    });
}


function renderSubjectDetailPage() {
    if (!selectedSubject) {
        appRoot.innerHTML = `<div class="flex items-center justify-center min-h-screen">Loading subject...</div>`;
        return;
    }

    const subjectChapters = chapters[selectedSubject.id] || [];
    const totalChapters = subjectChapters.length;
    const completedCount = subjectChapters.filter(chapter =>
        isChapterComplete(selectedSubject.id, chapter.title)
    ).length;
    const progressPercentage = totalChapters > 0 ? (completedCount / totalChapters) * 100 : 0;

    appRoot.innerHTML = `
        <div class="flex flex-col items-center p-4 min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 pb-20">
            <div class="w-full max-w-3xl flex justify-start mb-6">
                <button id="back-to-home" class="flex items-center text-purple-700 hover:text-purple-900 font-medium transition duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left mr-2"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                    Back to Subjects
                </button>
            </div>
            <h1 class="text-4xl font-extrabold text-gray-900 mb-4 text-center leading-tight">
                ${selectedSubject.title} Chapters
            </h1>
            <div class="w-full max-w-3xl mb-8">
                <div class="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                    <span>Progress: ${completedCount}/${totalChapters} Chapters</span>
                    <span>${progressPercentage.toFixed(0)}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div class="bg-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out" style="width: ${progressPercentage}%"></div>
                </div>
            </div>
            <div class="w-full max-w-3xl space-y-4">
                ${subjectChapters.length > 0 ?
                    subjectChapters.map((chapter, index) => {
                        const isComplete = isChapterComplete(selectedSubject.id, chapter.title);
                        const hasQuiz = chapter.quiz && chapter.quiz.length > 0;
                        return `
                        <div
                            class="bg-white p-6 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${isComplete ? 'border-l-4 border-green-500' : ''}"
                        >
                            <div class="flex-1 mb-4 sm:mb-0 sm:mr-4">
                                <span class="text-lg font-medium text-gray-800 flex items-center">
                                    ${isComplete ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle text-green-500 mr-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-8.5"/><path d="m9 11 3 3L22 4"/></svg>` : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open text-gray-400 mr-2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`}
                                    ${chapter.title}
                                </span>
                            </div>
                            <div class="flex flex-wrap justify-center sm:justify-end gap-2">
                                <button
                                    data-chapter-title="${encodeURIComponent(chapter.title)}"
                                    class="read-chapter-button bg-purple-600 text-white p-3 rounded-full shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-200"
                                    aria-label="Read chapter ${chapter.title}"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M22.42 1.58a15 15 0 0 1 0 20.84"/></svg>
                                </button>
                                ${hasQuiz ? `
                                <button
                                    data-chapter-title="${encodeURIComponent(chapter.title)}"
                                    class="take-quiz-button bg-yellow-400 text-purple-900 p-3 rounded-full shadow-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition duration-200"
                                    aria-label="Take quiz for ${chapter.title}"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-check"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
                                </button>` : ''}
                            </div>
                        </div>
                    `;
                }).join('')
                    :
                    `<p class="text-center text-gray-600 text-lg">No chapters available for this subject yet.</p>`
                }
            </div>
        </div>
    `;
    // Attach event listeners for back button and read buttons
    document.getElementById('back-to-home').addEventListener('click', () => navigateTo('home'));
    appRoot.querySelectorAll('.read-chapter-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const chapterTitle = decodeURIComponent(event.currentTarget.dataset.chapterTitle);
            handleReadChapter(selectedSubject.id, chapterTitle);
        });
    });
    appRoot.querySelectorAll('.take-quiz-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const chapterTitle = decodeURIComponent(event.currentTarget.dataset.chapterTitle);
            const chapter = chapters[selectedSubject.id].find(c => c.title === chapterTitle);
            if (chapter && chapter.quiz) {
                navigateTo('quizPage', { subjectId: selectedSubject.id, chapterTitle: chapter.title, quizData: chapter.quiz });
            } else {
                showToast('No quiz available for this chapter.', 'info');
            }
        });
    });
}

function renderChapterPage() {
    if (!selectedChapter || !selectedSubject) {
        appRoot.innerHTML = `<div class="flex items-center justify-center min-h-screen">Loading chapter...</div>`;
        return;
    }

    const isBookmarked = isChapterBookmarked(selectedSubject.id, selectedChapter.title);
    const isComplete = isChapterComplete(selectedSubject.id, selectedChapter.title);
    const hasQuiz = selectedChapter.quiz && selectedChapter.quiz.length > 0;
    const currentNote = getChapterNote(selectedSubject.id, selectedChapter.title);

    appRoot.innerHTML = `
        <div class="flex flex-col items-center p-4 min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 pb-20">
            <div class="w-full max-w-3xl flex justify-start mb-6">
                <button id="back-to-subject" class="flex items-center text-purple-700 hover:text-purple-900 font-medium transition duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left mr-2"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                    Back to Chapters
                </button>
            </div>
            <h1 class="text-4xl font-extrabold text-gray-900 mb-6 text-center leading-tight">
                ${selectedChapter.title}
            </h1>
            <div class="w-full max-w-3xl bg-white p-8 rounded-xl shadow-lg text-gray-800 leading-relaxed chapter-content">
                ${selectedChapter.content}
            </div>
            <div class="w-full max-w-3xl flex flex-wrap justify-center gap-4 mt-8">
                <button id="read-chapter-full" class="bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-purple-800 transition duration-300 shadow-md flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2 mr-2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M22.42 1.58a15 15 0 0 1 0 20.84"/></svg>
                    Read Aloud
                </button>
                <button id="mark-complete-button" class="${isComplete ? 'bg-green-500' : 'bg-blue-500'} text-white py-3 px-6 rounded-lg font-semibold text-lg ${isComplete ? '' : 'hover:bg-blue-600'} transition duration-300 shadow-md flex items-center ${isComplete ? 'cursor-not-allowed' : ''}" ${isComplete ? 'disabled' : ''}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check mr-2"><path d="M20 6 9 17l-5-5"/></svg>
                    ${isComplete ? 'Completed' : 'Mark as Complete'}
                </button>
                <button id="bookmark-button" class="${isBookmarked ? 'bg-yellow-500 text-purple-900' : 'bg-gray-200 text-gray-700'} py-3 px-6 rounded-lg font-semibold text-lg hover:bg-yellow-400 transition duration-300 shadow-md flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide ${isBookmarked ? 'lucide-bookmark-x' : 'lucide-bookmark'} mr-2"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/><path d="m14.5 9.5-3 3"/><path d="m11.5 9.5 3 3"/></svg>
                    ${isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                </button>
                ${hasQuiz ? `
                <button id="take-quiz-button" class="bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition duration-300 shadow-md flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-check mr-2"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
                    Take Quiz
                </button>` : ''}
            </div>

            <div class="w-full max-w-3xl mt-8 bg-white p-6 rounded-xl shadow-lg">
                <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil mr-2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="M15 5l4 4"/></svg>
                    Your Notes
                </h3>
                <textarea id="chapter-notes-textarea" rows="5" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200" placeholder="Write your notes here...">${currentNote}</textarea>
                <button id="save-note-button" class="mt-4 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition duration-300 shadow-md">
                    Save Note
                </button>
            </div>
        </div>
    `;
    // Attach event listeners for back button and read aloud button
    document.getElementById('back-to-subject').addEventListener('click', () => navigateTo('subjectDetail', selectedSubject));
    document.getElementById('read-chapter-full').addEventListener('click', () => speakText(document.querySelector('.chapter-content').innerText)); // Use innerText to get plain text for speech
    document.getElementById('mark-complete-button').addEventListener('click', () => markChapterComplete(selectedSubject.id, selectedChapter.title));
    document.getElementById('bookmark-button').addEventListener('click', () => toggleBookmark(selectedSubject.id, selectedChapter.title));
    if (hasQuiz) {
        document.getElementById('take-quiz-button').addEventListener('click', () => {
            navigateTo('quizPage', { subjectId: selectedSubject.id, chapterTitle: selectedChapter.title, quizData: selectedChapter.quiz });
        });
    }

    const noteTextarea = document.getElementById('chapter-notes-textarea');
    document.getElementById('save-note-button').addEventListener('click', () => {
        saveChapterNote(selectedSubject.id, selectedChapter.title, noteTextarea.value);
    });
}

function renderQuizPage() {
    if (!currentQuiz || !currentQuiz.quizData || currentQuiz.quizData.length === 0) {
        appRoot.innerHTML = `
            <div class="flex flex-col items-center p-4 min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 pb-20">
                <div class="w-full max-w-3xl flex justify-start mb-6">
                    <button id="back-from-quiz" class="flex items-center text-orange-700 hover:text-orange-900 font-medium transition duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left mr-2"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                        Back to Chapter
                    </button>
                </div>
                <h1 class="text-4xl font-extrabold text-gray-900 mt-8 mb-10 text-center leading-tight">Quiz Unavailable</h1>
                <p class="text-lg text-gray-700">There is no quiz for "${currentQuiz.chapterTitle || 'this chapter'}".</p>
            </div>
        `;
        document.getElementById('back-from-quiz').addEventListener('click', () => navigateTo('chapterDetail', { subjectId: currentQuiz.subjectId, title: currentQuiz.chapterTitle, content: chapters[currentQuiz.subjectId].find(c=>c.title===currentQuiz.chapterTitle).content }));
        return;
    }

    let quizHTML = `
        <div class="flex flex-col items-center p-4 min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 pb-20">
            <div class="w-full max-w-3xl flex justify-start mb-6">
                <button id="back-from-quiz" class="flex items-center text-orange-700 hover:text-orange-900 font-medium transition duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left mr-2"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                    Back to Chapter
                </button>
            </div>
            <h1 class="text-4xl font-extrabold text-gray-900 mt-8 mb-10 text-center leading-tight">
                Quiz: ${currentQuiz.chapterTitle}
            </h1>
            <form id="quiz-form" class="w-full max-w-3xl bg-white p-8 rounded-xl shadow-lg space-y-8">
    `;

    currentQuiz.quizData.forEach((q, qIndex) => {
        quizHTML += `
            <div class="question-item">
                <p class="text-xl font-semibold text-gray-800 mb-4">${qIndex + 1}. ${q.question}</p>
                <div class="space-y-3">
        `;
        q.options.forEach((option, oIndex) => {
            quizHTML += `
                <label class="flex items-center bg-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-200 transition duration-200">
                    <input type="radio" name="question-${qIndex}" value="${encodeURIComponent(option)}" class="mr-3 text-purple-600 focus:ring-purple-500">
                    <span class="text-gray-700">${option}</span>
                </label>
            `;
        });
        quizHTML += `
                </div>
            </div>
        `;
    });

    quizHTML += `
                <button type="submit" class="w-full bg-purple-700 text-white py-3 rounded-lg font-semibold text-lg hover:bg-purple-800 transition duration-300 shadow-lg">
                    Submit Quiz
                </button>
            </form>
            <div id="quiz-results" class="hidden w-full max-w-3xl bg-white p-8 rounded-xl shadow-lg mt-8 text-gray-800">
                <h2 class="text-3xl font-bold text-center mb-6">Quiz Results</h2>
                <div id="quiz-score" class="text-center text-2xl font-bold mb-6"></div>
                <div id="quiz-feedback" class="space-y-4"></div>
            </div>
        </div>
    `;

    appRoot.innerHTML = quizHTML;
    document.getElementById('back-from-quiz').addEventListener('click', () => navigateTo('chapterDetail', { subjectId: currentQuiz.subjectId, title: currentQuiz.chapterTitle, content: chapters[currentQuiz.subjectId].find(c=>c.title===currentQuiz.chapterTitle).content }));
    document.getElementById('quiz-form').addEventListener('submit', handleQuizSubmit);
}

function handleQuizSubmit(event) {
    event.preventDefault();
    const form = event.target;
    let score = 0;
    const feedbackHtml = [];

    currentQuiz.quizData.forEach((q, qIndex) => {
        const selectedOption = form.querySelector(`input[name="question-${qIndex}"]:checked`);
        const userAnswer = selectedOption ? decodeURIComponent(selectedOption.value) : null;
        const isCorrect = userAnswer === q.answer;

        if (isCorrect) {
            score++;
            feedbackHtml.push(`
                <div class="p-4 bg-green-100 rounded-lg">
                    <p class="font-semibold text-green-800">${qIndex + 1}. ${q.question}</p>
                    <p class="text-green-700">Your Answer: ${userAnswer} (Correct!)</p>
                </div>
            `);
        } else {
            feedbackHtml.push(`
                <div class="p-4 bg-red-100 rounded-lg">
                    <p class="font-semibold text-red-800">${qIndex + 1}. ${q.question}</p>
                    <p class="text-red-700">Your Answer: ${userAnswer || 'No answer selected'} (Incorrect)</p>
                    <p class="text-red-700">Correct Answer: ${q.answer}</p>
                </div>
            `);
        }
    });

    const totalQuestions = currentQuiz.quizData.length;
    const percentage = (score / totalQuestions) * 100;

    document.getElementById('quiz-form').classList.add('hidden');
    const resultsDiv = document.getElementById('quiz-results');
    resultsDiv.classList.remove('hidden');
    document.getElementById('quiz-score').textContent = `Score: ${score}/${totalQuestions} (${percentage.toFixed(0)}%)`;
    document.getElementById('quiz-feedback').innerHTML = feedbackHtml.join('');

    showToast(`You scored ${score} out of ${totalQuestions}!`, score >= totalQuestions * 0.7 ? 'success' : 'info');
}


function renderLibraryPage() {
    appRoot.innerHTML = `
        <div class="flex flex-col items-center p-4 min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 pb-20">
            <h1 class="text-4xl font-extrabold text-gray-900 mt-8 mb-10 text-center leading-tight">
                Your Study Library
            </h1>
            <div class="w-full max-w-lg mb-8">
                <input type="text" id="library-search-input" placeholder="Search subjects in library..." class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-purple-500 focus:border-purple-500 transition duration-200 shadow-md">
            </div>
            <div id="library-content" class="w-full max-w-3xl space-y-4">
                ${subjects.map(subject => {
                    const totalChapters = chapters[subject.id]?.length || 0;
                    const completedChapters = currentUser?.chaptersCompleted?.[subject.id] || {};
                    const completedCount = Object.values(completedChapters).filter(status => status).length;
                    const progressPercentage = totalChapters > 0 ? (completedCount / totalChapters) * 100 : 0;

                    return `
                    <div class="bg-white p-6 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                        <div class="flex items-center mb-4 sm:mb-0 sm:mr-4">
                            <div class="p-3 rounded-full ${subject.color} text-white mr-4 flex-shrink-0">
                                ${subject.icon.replace(/width='64' height='64'/g, 'width="32" height="32"')}
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xl font-semibold text-gray-800 text-center sm:text-left">${subject.title}</span>
                                <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div class="bg-teal-600 h-2 rounded-full transition-all duration-500 ease-out" style="width: ${progressPercentage}%"></div>
                                </div>
                                <span class="text-sm text-gray-600 mt-1">${completedCount}/${totalChapters} Chapters Completed (${progressPercentage.toFixed(0)}%)</span>
                            </div>
                        </div>
                        <button
                            data-subject-id="${subject.id}"
                            class="view-subject-button bg-teal-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-teal-700 transition duration-200 shadow-md"
                        >
                            View Chapters
                        </button>
                    </div>
                `;
                }).join('')}
            </div>
        </div>
    `;
    appRoot.querySelectorAll('.view-subject-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const subjectId = event.currentTarget.dataset.subjectId;
            handleSubjectClick(subjectId);
        });
    });

    const librarySearchInput = document.getElementById('library-search-input');
    librarySearchInput.addEventListener('input', (event) => {
        const query = event.target.value.toLowerCase();
        const filteredSubjects = subjects.filter(subject =>
            subject.title.toLowerCase().includes(query)
        );
        const libraryContent = document.getElementById('library-content');
        libraryContent.innerHTML = filteredSubjects.map(subject => {
            const totalChapters = chapters[subject.id]?.length || 0;
            const completedChapters = currentUser?.chaptersCompleted?.[subject.id] || {};
            const completedCount = Object.values(completedChapters).filter(status => status).length;
            const progressPercentage = totalChapters > 0 ? (completedCount / totalChapters) * 100 : 0;
            return `
                <div class="bg-white p-6 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                    <div class="flex items-center mb-4 sm:mb-0 sm:mr-4">
                        <div class="p-3 rounded-full ${subject.color} text-white mr-4 flex-shrink-0">
                            ${subject.icon.replace(/width='64' height='64'/g, 'width="32" height="32"')}
                        </div>
                        <div class="flex flex-col">
                            <span class="text-xl font-semibold text-gray-800 text-center sm:text-left">${subject.title}</span>
                            <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div class="bg-teal-600 h-2 rounded-full transition-all duration-500 ease-out" style="width: ${progressPercentage}%"></div>
                            </div>
                            <span class="text-sm text-gray-600 mt-1">${completedCount}/${totalChapters} Chapters Completed (${progressPercentage.toFixed(0)}%)</span>
                        </div>
                    </div>
                    <button
                        data-subject-id="${subject.id}"
                        class="view-subject-button bg-teal-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-teal-700 transition duration-200 shadow-md"
                    >
                        View Chapters
                    </button>
                </div>
            `;
        }).join('');
        libraryContent.querySelectorAll('.view-subject-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const subjectId = event.currentTarget.dataset.subjectId;
                handleSubjectClick(subjectId);
            });
        });
    });
}

function renderBookmarksPage() {
    if (!currentUser) {
        appRoot.innerHTML = `<div class="flex items-center justify-center min-h-screen">Please log in to view bookmarks.</div>`;
        return;
    }

    const bookmarkedChapters = currentUser.bookmarkedChapters || [];

    appRoot.innerHTML = `
        <div class="flex flex-col items-center p-4 min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 pb-20">
            <h1 class="text-4xl font-extrabold text-gray-900 mt-8 mb-10 text-center leading-tight">
                Your Bookmarked Chapters
            </h1>
            <div class="w-full max-w-3xl space-y-4">
                ${bookmarkedChapters.length > 0 ?
                    bookmarkedChapters.map(bookmark => {
                        const subject = subjects.find(s => s.id === bookmark.subjectId);
                        if (!subject) return ''; // Should not happen
                        const chapter = chapters[bookmark.subjectId]?.find(c => c.title === bookmark.chapterTitle);
                        if (!chapter) return ''; // Should not happen
                        return `
                            <div class="bg-white p-6 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                                <div class="flex items-center mb-4 sm:mb-0 sm:mr-4">
                                    <div class="p-2 rounded-full ${subject.color} text-white mr-4 flex-shrink-0">
                                        ${subject.icon.replace(/width='64' height='64'/g, 'width="24" height="24"')}
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="text-lg font-semibold text-gray-800">${bookmark.chapterTitle}</span>
                                        <span class="text-sm text-gray-600">From: ${subject.title}</span>
                                    </div>
                                </div>
                                <div class="flex flex-wrap justify-center sm:justify-end gap-2">
                                    <button
                                        data-subject-id="${bookmark.subjectId}"
                                        data-chapter-title="${encodeURIComponent(bookmark.chapterTitle)}"
                                        class="read-bookmarked-chapter-button bg-rose-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-rose-700 transition duration-200 shadow-md"
                                    >
                                        Read
                                    </button>
                                    <button
                                        data-subject-id="${bookmark.subjectId}"
                                        data-chapter-title="${encodeURIComponent(bookmark.chapterTitle)}"
                                        class="remove-bookmark-button bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition duration-200 shadow-md"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')
                    :
                    `<p class="text-center text-gray-600 text-lg">You haven't bookmarked any chapters yet.</p>`
                }
            </div>
        </div>
    `;

    appRoot.querySelectorAll('.read-bookmarked-chapter-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const subjectId = event.currentTarget.dataset.subjectId;
            const chapterTitle = decodeURIComponent(event.currentTarget.dataset.chapterTitle);
            handleReadChapter(subjectId, chapterTitle);
        });
    });

    appRoot.querySelectorAll('.remove-bookmark-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            const subjectId = event.currentTarget.dataset.subjectId;
            const chapterTitle = decodeURIComponent(event.currentTarget.dataset.chapterTitle);
            await toggleBookmark(subjectId, chapterTitle); // This also re-renders bookmarks page
            renderBookmarksPage(); // Ensure page updates after removal
        });
    });
}

function renderProfilePage() {
    const username = currentUser ? currentUser.username : 'Guest';
    const totalSubjects = subjects.length;
    let completedSubjectsCount = 0;
    let totalChaptersGlobal = 0;
    let completedChaptersGlobal = 0;

    subjects.forEach(subject => {
        const subjectChapters = chapters[subject.id] || [];
        totalChaptersGlobal += subjectChapters.length;
        const completedInSubject = subjectChapters.filter(chapter =>
            isChapterComplete(subject.id, chapter.title)
        ).length;
        if (completedInSubject === subjectChapters.length && subjectChapters.length > 0) {
            completedSubjectsCount++;
        }
        completedChaptersGlobal += completedInSubject;
    });

    const lastViewedSubject = currentUser?.lastViewedSubject || 'None';

    appRoot.innerHTML = `
        <div class="flex flex-col items-center p-4 min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 pb-20">
            <h1 class="text-4xl font-extrabold text-gray-900 mt-8 mb-10 text-center leading-tight">
                Your Profile
            </h1>
            <div class="bg-white p-8 rounded-xl shadow-xl w-full max-w-md space-y-6 text-gray-800">
                <div class="flex items-center justify-center mb-6">
                    <div class="w-24 h-24 rounded-full bg-purple-200 flex items-center justify-center text-purple-800 text-5xl font-bold border-4 border-purple-300 shadow-inner">
                        ${username.charAt(0).toUpperCase()}
                    </div>
                </div>
                <div class="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span class="font-semibold text-lg">Username:</span>
                    <span class="text-lg">${username}</span>
                </div>
                <div class="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span class="font-semibold text-lg">Subjects Mastered:</span>
                    <span class="text-lg">${completedSubjectsCount}/${totalSubjects}</span>
                </div>
                <div class="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span class="font-semibold text-lg">Chapters Completed:</span>
                    <span class="text-lg">${completedChaptersGlobal}/${totalChaptersGlobal}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="font-semibold text-lg">Last Viewed Subject:</span>
                    <span class="text-lg">${lastViewedSubject}</span>
                </div>
            </div>
            <p class="text-center text-gray-600 text-lg mt-8">
                Your learning journey at GoDix!
            </p>
        </div>
    `;
}

function renderSettingsPage() {
    const currentVoice = currentUser?.settings?.speechVoice || 'Google US English';
    const currentRate = currentUser?.settings?.speechRate || 1.0;
    const isDarkMode = currentUser?.settings?.darkMode || false;
    const currentFontSize = currentUser?.settings?.fontSize || 'medium';
    const isHighContrast = currentUser?.settings?.highContrast || false;

    const voiceOptions = availableVoices.map(voice => `
        <option value="${voice.name}" ${voice.name === currentVoice ? 'selected' : ''}>
            ${voice.name} (${voice.lang})
        </option>
    `).join('');

    appRoot.innerHTML = `
        <div class="flex flex-col items-center p-4 min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 pb-20">
            <h1 class="text-4xl font-extrabold text-gray-900 mt-8 mb-10 text-center leading-tight">
                Settings
            </h1>
            <div class="bg-white p-8 rounded-xl shadow-xl w-full max-w-md space-y-6 text-gray-800">
                <div class="flex items-center justify-between">
                    <label for="dark-mode-toggle" class="block text-lg font-semibold">Dark Mode:</label>
                    <input type="checkbox" id="dark-mode-toggle" class="h-6 w-12 rounded-full appearance-none cursor-pointer bg-gray-300 checked:bg-purple-600 transition duration-300 relative" ${isDarkMode ? 'checked' : ''}>
                    <span class="absolute top-1/2 left-1 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full transition-transform duration-300"></span>
                </div>
                
                <div>
                    <label for="font-size-select" class="block text-lg font-semibold mb-2">Font Size:</label>
                    <select id="font-size-select" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200">
                        <option value="small" ${currentFontSize === 'small' ? 'selected' : ''}>Small</option>
                        <option value="medium" ${currentFontSize === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="large" ${currentFontSize === 'large' ? 'selected' : ''}>Large</option>
                        <option value="x-large" ${currentFontSize === 'x-large' ? 'selected' : ''}>Extra Large</option>
                    </select>
                </div>

                <div class="flex items-center justify-between">
                    <label for="high-contrast-toggle" class="block text-lg font-semibold">High Contrast (Experimental):</label>
                    <input type="checkbox" id="high-contrast-toggle" class="h-6 w-12 rounded-full appearance-none cursor-pointer bg-gray-300 checked:bg-purple-600 transition duration-300 relative" ${isHighContrast ? 'checked' : ''}>
                </div>

                <div>
                    <label for="speech-voice-select" class="block text-lg font-semibold mb-2">Speech Voice:</label>
                    <select id="speech-voice-select" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200">
                        ${voiceOptions}
                    </select>
                </div>
                <div>
                    <label for="speech-rate-slider" class="block text-lg font-semibold mb-2">Speech Rate: <span id="speech-rate-value">${currentRate.toFixed(1)}</span>x</label>
                    <input type="range" id="speech-rate-slider" min="0.5" max="2.0" step="0.1" value="${currentRate}" class="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600">
                </div>
                
                <button id="send-feedback-button" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition duration-300 shadow-lg">
                    Send Feedback
                </button>

                <button id="clear-data-button" class="w-full bg-red-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-red-700 transition duration-300 shadow-lg mt-4">
                    Clear All My Data
                </button>
            </div>
            <p class="text-center text-gray-600 text-lg mt-8">
                Customize your GoDix experience.
            </p>
        </div>
    `;

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const fontSizeSelect = document.getElementById('font-size-select');
    const highContrastToggle = document.getElementById('high-contrast-toggle');
    const speechVoiceSelect = document.getElementById('speech-voice-select');
    const speechRateSlider = document.getElementById('speech-rate-slider');
    const speechRateValue = document.getElementById('speech-rate-value');
    const sendFeedbackButton = document.getElementById('send-feedback-button');
    const clearDataButton = document.getElementById('clear-data-button');

    darkModeToggle.addEventListener('change', toggleDarkMode);
    fontSizeSelect.addEventListener('change', (e) => setFontSize(e.target.value));
    highContrastToggle.addEventListener('change', toggleHighContrast);

    speechRateSlider.addEventListener('input', () => {
        speechRateValue.textContent = parseFloat(speechRateSlider.value).toFixed(1);
    });

    // Save speech settings on change for better UX without a separate "save" button for these
    speechVoiceSelect.addEventListener('change', async () => {
        if (!currentUser) return;
        currentUser.settings.speechVoice = speechVoiceSelect.value;
        await saveUserData(currentUser);
        showToast('Speech voice updated!', 'info');
    });
    speechRateSlider.addEventListener('change', async () => {
        if (!currentUser) return;
        currentUser.settings.speechRate = parseFloat(speechRateSlider.value);
        await saveUserData(currentUser);
        showToast('Speech rate updated!', 'info');
    });


    sendFeedbackButton.addEventListener('click', () => navigateTo('feedback'));

    clearDataButton.addEventListener('click', async () => {
        // Using window.confirm as a simple modal for critical action
        const confirmClear = window.confirm('Are you sure you want to clear ALL your data (including progress, bookmarks, and notes)? This cannot be undone.');
        if (confirmClear) {
            try {
                await clearAllUserData();
                showToast('All user data cleared. Logging out...', 'success');
                handleLogout(); // Log out after clearing data
            } catch (error) {
                console.error('Error clearing data:', error);
                showToast('Failed to clear data.', 'error');
            }
        }
    });
}

function renderFeedbackPage() {
    appRoot.innerHTML = `
        <div class="flex flex-col items-center p-4 min-h-screen bg-gradient-to-br from-green-50 to-blue-100 pb-20">
            <div class="w-full max-w-3xl flex justify-start mb-6">
                <button id="back-from-feedback" class="flex items-center text-blue-700 hover:text-blue-900 font-medium transition duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left mr-2"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                    Back to Settings
                </button>
            </div>
            <h1 class="text-4xl font-extrabold text-gray-900 mt-8 mb-10 text-center leading-tight">
                Send Us Your Feedback
            </h1>
            <div class="bg-white p-8 rounded-xl shadow-xl w-full max-w-md space-y-6 text-gray-800">
                <p class="text-center text-gray-600 mb-6">We'd love to hear from you!</p>
                <form id="feedback-form" class="space-y-4">
                    <div>
                        <label for="feedback-email" class="block text-sm font-medium text-gray-700 mb-1">Your Email (Optional)</label>
                        <input type="email" id="feedback-email" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="your@example.com">
                    </div>
                    <div>
                        <label for="feedback-message" class="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                        <textarea id="feedback-message" rows="6" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Type your feedback here..." required></textarea>
                    </div>
                    <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition duration-300 shadow-lg">
                        Submit Feedback
                    </button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('back-from-feedback').addEventListener('click', () => navigateTo('settings'));
    document.getElementById('feedback-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('feedback-email').value;
        const message = document.getElementById('feedback-message').value;

        if (message.trim() === '') {
            showToast('Message cannot be empty.', 'error');
            return;
        }

        // Simulate sending feedback (in a real app, this would be an API call)
        console.log('Feedback submitted:', { email, message });
        showToast('Thank you for your feedback!', 'success');
        document.getElementById('feedback-form').reset(); // Clear form
    });
}


function renderPage() {
    if (!isLoggedIn) {
        renderAuthPage();
    } else {
        switch (currentPage) {
            case 'home':
                renderHomePage();
                break;
            case 'subjectDetail':
                renderSubjectDetailPage();
                break;
            case 'chapterDetail':
                renderChapterPage();
                break;
            case 'quizPage':
                renderQuizPage();
                break;
            case 'library':
                renderLibraryPage();
                break;
            case 'profile':
                renderProfilePage();
                break;
            case 'settings':
                renderSettingsPage();
                break;
            case 'bookmarks':
                renderBookmarksPage();
                break;
            case 'feedback':
                renderFeedbackPage();
                break;
            default:
                renderHomePage(); // Fallback
                break;
        }
    }
}

function updateFooterVisibility() {
    if (isLoggedIn) {
        appFooter.classList.remove('hidden');
    } else {
        appFooter.classList.add('hidden');
    }
}

function updateFooterActiveState() {
    document.querySelectorAll('#app-footer button').forEach(button => {
        button.classList.remove('text-purple-700', 'font-semibold');
        button.classList.add('text-gray-600'); // Ensure all are gray by default
    });

    let activeNavButtonId = '';
    if (currentPage === 'home' || currentPage === 'subjectDetail' || currentPage === 'chapterDetail' || currentPage === 'quizPage') {
        activeNavButtonId = 'nav-home';
    } else if (currentPage === 'library') {
        activeNavButtonId = 'nav-library';
    } else if (currentPage === 'bookmarks') {
        activeNavButtonId = 'nav-bookmarks';
    }
    else if (currentPage === 'profile') {
        activeNavButtonId = 'nav-profile';
    } else if (currentPage === 'settings' || currentPage === 'feedback') {
        activeNavButtonId = 'nav-settings';
    }

    const activeBtn = document.getElementById(activeNavButtonId);
    if (activeBtn) {
        activeBtn.classList.remove('text-gray-600');
        activeBtn.classList.add('text-purple-700', 'font-semibold');
    }
}

// --- Initial Setup and Event Listeners (DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize IndexedDB
    try {
        await openGoDixDB();
        console.log('IndexedDB opened successfully.');
    } catch (error) {
        console.error('Failed to open IndexedDB:', error);
        showToast('Failed to initialize local storage.', 'error');
    }

    // Initialize ad logic (from pop.js)
    initializeAdLogic();

    // Populate available voices for speech synthesis
    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
            availableVoices = window.speechSynthesis.getVoices();
            if (isLoggedIn) { // Only greet if already logged in and voices are loaded
                greetUser();
            }
            if (currentPage === 'settings') {
                renderSettingsPage(); // Re-render settings to show voices
            }
        };
        // If voices are already loaded
        if (window.speechSynthesis.getVoices().length > 0) {
            availableVoices = window.speechSynthesis.getVoices();
        }
    } else {
        showMessageBox("Speech synthesis is not supported in this browser.");
    }

    // Event listener for modal OK button
    modalOkButton.addEventListener('click', hideMessageBox);

    // Event listeners for footer navigation (delegation)
    appFooter.addEventListener('click', (event) => {
        const targetButton = event.target.closest('button');
        if (!targetButton) return;

        switch (targetButton.id) {
            case 'nav-home':
                navigateTo('home');
                break;
            case 'nav-library':
                navigateTo('library');
                break;
            case 'nav-bookmarks':
                navigateTo('bookmarks');
                break;
            case 'nav-profile':
                navigateTo('profile');
                break;
            case 'nav-settings':
                navigateTo('settings');
                break;
            case 'nav-logout':
                handleLogout();
                break;
        }
    });

    // Check login status from Local Storage on load
    const storedLoggedInStatus = localStorage.getItem('isLoggedIn');
    const lastLoggedInUser = localStorage.getItem('lastLoggedInUser');

    if (storedLoggedInStatus === 'true' && lastLoggedInUser) {
        try {
            const user = await getUserData(lastLoggedInUser);
            if (user) {
                isLoggedIn = true;
                currentUser = user; // Load the full user object
                applyUserSettings(); // Apply settings from loaded user
                currentPage = 'home'; // Go directly to home if already logged in
                showToast('Welcome back, ' + currentUser.username + '!', 'info');
                // Greet user only if voices are loaded, otherwise it will be called by onvoiceschanged
                if (availableVoices.length > 0) {
                    greetUser();
                }
            } else {
                // User not found in DB, clear local storage
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('lastLoggedInUser');
                isLoggedIn = false;
                showToast('Your session expired. Please log in again.', 'info');
            }
        } catch (error) {
            console.error('Error retrieving user from IndexedDB on load:', error);
            showToast('Failed to load user session.', 'error');
            isLoggedIn = false;
        }
    }

    // Initial render based on login status
    renderPage();
    updateFooterVisibility();
});
