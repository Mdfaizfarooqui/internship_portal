<?php
// seed_internships_v2.php
include_once __DIR__ . '/config/Database.php';
include_once __DIR__ . '/models/Internship.php';

$database = new Database();
$db = $database->getConnection();
$internship = new Internship($db);

$internships = [
    [
        'company' => 'Google',
        'position' => 'Frontend Developer Intern',
        'description' => 'Join our core engineering team to build the next generation of web applications. You will work with React, TypeScript, and modern web technologies to create performant and accessible user interfaces.',
        'location' => 'Mountain View, CA',
        'duration' => '3 Months',
        'stipend' => '₹60,000/month',
        'type' => 'Full-time',
        'requirements' => "Proficiency in JavaScript, HTML, and CSS.\nExperience with React or Angular.\nUnderstanding of web performance and accessibility.",
        'responsibilities' => "Develop new user-facing features.\nBuild reusable code and libraries.\nOptimize application for maximum speed and scalability.",
        'deadline' => date('Y-m-d', strtotime('+30 days')),
        'skills' => ['React', 'TypeScript', 'JavaScript', 'CSS']
    ],
    [
        'company' => 'Microsoft',
        'position' => 'Full Stack Engineering Intern',
        'description' => 'Work on large-scale cloud services and web applications. You will have the opportunity to work on both backend services in C#/.NET and frontend interfaces in React.',
        'location' => 'Redmond, WA',
        'duration' => '4 Months',
        'stipend' => '₹55,000/month',
        'type' => 'Full-time',
        'requirements' => "Experience with C#, Java, or Python.\nKnowledge of frontend frameworks like React.\nFamiliarity with SQL and databases.",
        'responsibilities' => "Design and implement scalable web services.\nCollaborate with PMs and designers.\nWrite clean, testable code.",
        'deadline' => date('Y-m-d', strtotime('+45 days')),
        'skills' => ['C#', '.NET', 'React', 'SQL', 'Azure']
    ],
    [
        'company' => 'Amazon',
        'position' => 'Data Analyst Intern',
        'description' => 'Analyze large datasets to extract actionable insights for our e-commerce platform. You will work with SQL, Python, and visualization tools like Tableau.',
        'location' => 'Seattle, WA',
        'duration' => '3 Months',
        'stipend' => '₹50,000/month',
        'type' => 'Remote',
        'requirements' => "Strong knowledge of SQL.\nExperience with Python (Pandas, NumPy).\nAbility to create data visualizations.",
        'responsibilities' => "Perform ad-hoc analysis to support business decisions.\nBuild and maintain dashboards.\nAutomate data reporting processes.",
        'deadline' => date('Y-m-d', strtotime('+20 days')),
        'skills' => ['SQL', 'Python', 'Tableau', 'Data Analysis']
    ],
    [
        'company' => 'Airbnb',
        'position' => 'Product Design Intern',
        'description' => 'Help design the future of travel. You will work closely with product managers and engineers to design intuitive and beautiful user experiences.',
        'location' => 'San Francisco, CA',
        'duration' => '3 Months',
        'stipend' => '₹52,000/month',
        'type' => 'Hybrid',
        'requirements' => "Portfolio demonstrating strong UX/UI skills.\nProficiency in Figma and prototyping tools.\nUnderstanding of design systems.",
        'responsibilities' => "Create user flows, wireframes, and high-fidelity mockups.\nConduct user research and usability testing.\nCollaborate with engineers on implementation.",
        'deadline' => date('Y-m-d', strtotime('+40 days')),
        'skills' => ['Figma', 'UI/UX', 'Prototyping', 'User Research']
    ],
    [
        'company' => 'Spotify',
        'position' => 'Marketing Intern',
        'description' => 'Join our global marketing team to help bring music to the world. You will assist with social media campaigns, content creation, and market research.',
        'location' => 'New York, NY',
        'duration' => '6 Months',
        'stipend' => '₹35,000/month',
        'type' => 'Part-time',
        'requirements' => "Strong written and verbal communication skills.\nFamiliarity with social media platforms.\nCreative mindset and attention to detail.",
        'responsibilities' => "Assist in planning and executing marketing campaigns.\nDraft copy for social media posts.\nAnalyze campaign performance metrics.",
        'deadline' => date('Y-m-d', strtotime('+15 days')),
        'skills' => ['Social Media', 'Content Marketing', 'Copywriting', 'Analytics']
    ]
];

echo "Seeding Internships...\n";

foreach ($internships as $data) {
    $internship->company = $data['company'];
    $internship->position = $data['position'];
    $internship->description = $data['description'];
    $internship->location = $data['location'];
    $internship->duration = $data['duration'];
    $internship->stipend = $data['stipend'];
    $internship->type = $data['type'];
    $internship->requirements = $data['requirements'];
    $internship->responsibilities = $data['responsibilities'];
    $internship->deadline = $data['deadline'];
    $internship->required_skills = $data['skills'];

    if ($internship->create()) {
        echo "Created internship at " . $data['company'] . "\n";
    } else {
        echo "Failed to create internship at " . $data['company'] . "\n";
    }
}

echo "Seeding complete.\n";
?>
