'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, Briefcase, Code, Mail, Github, Linkedin, Phone, MapPin, ExternalLink, Menu, X, FileText, Send } from 'lucide-react';
import * as THREE from 'three';
import emailjs from 'emailjs-com';
import SpotlightCard from './SpotlightCard';
import Link from 'next/link';
import dynamic from 'next/dynamic';
// Removed unused LogoLoop import
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiPython, SiFastapi, SiPostgresql, SiDocker, SiAmazon } from 'react-icons/si';

const GitHubCalendar: React.ComponentType<any> = dynamic(() => import('react-github-calendar').then((mod) => (mod as any).default || mod), {
  ssr: false,
  loading: () => <div className="w-full h-32 animate-pulse bg-gray-800/50 rounded-lg"></div>
});

const ProfessionalPortfolio = () => {
  const [mounted, setMounted] = useState(false);
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthGroupRef = useRef<THREE.Group | null>(null);
  const scrollY = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const roles = ["DEVELOPER", "DESIGNER", "PROBLEM SOLVER"];

  useEffect(() => {
    setMounted(true);
    // Initialize EmailJS with your public key
    emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your actual EmailJS public key
  }, []);

  // Fixed typing effect with proper cleanup
  useEffect(() => {
    if (!mounted) return;

    const currentRole = roles[currentRoleIndex];
    let timeout: NodeJS.Timeout | undefined;

    if (isTyping) {
      if (displayedText.length < currentRole.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentRole.slice(0, displayedText.length + 1));
        }, 100);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 50);
      } else {
        setCurrentRoleIndex((prev: number) => (prev + 1) % roles.length);
        setIsTyping(true);
      }
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [displayedText, isTyping, currentRoleIndex, mounted, roles]);

  // Handle scroll for section activation
  useEffect(() => {
    const handleScroll = () => {
      scrollY.current = window.scrollY;
      const documentHeight = document.body.scrollHeight - window.innerHeight;
      setScrollProgress(documentHeight > 0 ? Math.min(scrollY.current / documentHeight, 1) : 0);

      // Section activation logic
      const sections = ['home', 'about', 'experience', 'projects', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && scrollPosition >= element.offsetTop &&
          scrollPosition < element.offsetTop + element.offsetHeight) {
          setActiveSection(section);
          break;
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial call
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Three.js Earth-Focused Solar System - Updated for black and white theme
  useEffect(() => {
    if (!mounted || !containerRef.current || typeof window === 'undefined') return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(isDarkMode ? 0x000000 : 0xffffff, 0.7);
    containerRef.current.appendChild(renderer.domElement);

    // Create minimalist stars background
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const radius = 100 + Math.random() * 900;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i3 + 2] = radius * Math.cos(phi);
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const starMaterial = new THREE.PointsMaterial({
      color: isDarkMode ? 0xffffff : 0x000000,
      size: 0.8,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Create geometric sun
    const sunGeometry = new THREE.SphereGeometry(6, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: isDarkMode ? 0xffffff : 0x000000,
      transparent: true,
      opacity: 0.8
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(60, 15, 60);
    scene.add(sun);

    // Create earth group
    const earthGroup = new THREE.Group();
    earthGroupRef.current = earthGroup;
    scene.add(earthGroup);

    // Create minimalist earth with geometric design
    const earthGeometry = new THREE.SphereGeometry(2.5, 32, 32);
    const earthMaterial = new THREE.MeshLambertMaterial({
      color: isDarkMode ? 0xffffff : 0x000000,
      transparent: true,
      opacity: 0.9
    });

    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earth);

    // Add geometric wireframe overlay
    const earthWireframe = new THREE.Mesh(
      earthGeometry,
      new THREE.MeshBasicMaterial({
        color: isDarkMode ? 0xcccccc : 0x333333,
        wireframe: true,
        transparent: true,
        opacity: 0.2
      })
    );
    earthGroup.add(earthWireframe);

    // Create geometric moon
    const moonGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const moonMaterial = new THREE.MeshLambertMaterial({
      color: isDarkMode ? 0xdddddd : 0x222222,
      transparent: true,
      opacity: 0.8
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(6, 0, 0);
    earthGroup.add(moon);

    // Create elegant moon orbit ring
    const moonOrbitGeometry = new THREE.RingGeometry(5.8, 6.2, 64);
    const moonOrbitMaterial = new THREE.MeshBasicMaterial({
      color: isDarkMode ? 0xffffff : 0x000000,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide
    });
    const moonOrbit = new THREE.Mesh(moonOrbitGeometry, moonOrbitMaterial);
    moonOrbit.rotation.x = Math.PI / 2;
    earthGroup.add(moonOrbit);

    // Add sophisticated lighting
    const ambientLight = new THREE.AmbientLight(isDarkMode ? 0x404040 : 0x808080, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(isDarkMode ? 0xffffff : 0x222222, 0.8);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);

    // Initial camera position
    camera.position.set(0, 2, 12);
    camera.lookAt(0, 0, 0);

    // Handle mouse movement
    const handleMouseMove = (event: MouseEvent) => {
      if (earthGroup) {
        earthGroup.rotation.y = (event.clientX / window.innerWidth - 0.5) * 0.3;
        earthGroup.rotation.x = (event.clientY / window.innerHeight - 0.5) * 0.1;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Rotate earth elegantly
      if (earthGroup) {
        earth.rotation.y += 0.003;
        earthWireframe.rotation.y += 0.0025;

        // Moon orbit
        moon.position.x = Math.cos(elapsedTime * 0.4) * 6;
        moon.position.z = Math.sin(elapsedTime * 0.4) * 6;
        moon.rotation.y += 0.002;
      }

      // Smooth camera movement based on scroll
      const scrollFactor = Math.min(scrollY.current * 0.0008, 1);
      camera.position.z = 12 - scrollFactor * 18;
      camera.position.y = 2 + scrollFactor * 8;
      camera.position.x = scrollFactor * 5;

      camera.lookAt(0, scrollFactor * 3, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (containerRef.current && renderer && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }

      if (renderer) {
        renderer.dispose();
      }

      // Dispose geometries and materials
      if (scene) {
        scene.traverse((object: THREE.Object3D) => {
          if (object instanceof THREE.Mesh) {
            object.geometry?.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((material: THREE.Material) => material.dispose());
            } else {
              object.material?.dispose();
            }
          }
        });
      }
    };
  }, [mounted, isDarkMode]);

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'about', icon: User, label: 'About' },
    { id: 'experience', icon: Briefcase, label: 'Experience' },
    { id: 'projects', icon: Code, label: 'Projects' },
    { id: 'contact', icon: Mail, label: 'Contact' }
  ];

  const projects = [
    {
      id: 1,
      title: 'Hey Attrangi Meet',
      description: 'A sophisticated AI-Powered Video Conferencing Platform designed effectively for huddle rooms. Features include intelligent host controls, real-time smart noise suppression, and seamless screen sharing capabilities, ensuring a crystal-clear communication experience for all participants.',
      technologies: ['React', 'WebRTC', 'AI', 'Mobile', 'Docker', 'AWS'],
      category: 'Video Conferencing',
      year: '2025',
      achievement: 'Low-latency',
      link: '#'
    },
    {
      id: 2,
      title: 'Pragya',
      description: 'An advanced Emotionally Intelligent Mental Health Chatbot capable of detecting nuanced signs of stress, anxiety, and fatigue. Powered by a custom NeuroEngine, it provides empathetic conversations and actionable wellness insights to support user mental health journeys.',
      technologies: ['FastAPI', 'LangChain', 'Next.js', 'PostgreSQL'],
      category: 'AI/Health',
      year: '2025',
      achievement: 'Context Aware',
      link: '#'
    },
    {
      id: 3,
      title: 'Solar Power Prediction',
      description: 'Engineered a high-precision ML-based Solar Power Prediction System achieving 92% accuracy. Integrated real-time weather APIs to forecast energy output, enabling efficient grid management and renewable energy optimization for sustainable power usage.',
      technologies: ['Python', 'scikit-learn', 'Plotly', 'Streamlit'],
      category: 'ML/Data Science',
      year: '2025',
      achievement: '92% Accuracy',
      link: '#'
    },
    {
      id: 4,
      title: 'Geolocation-Based Attendance System',
      description: 'Developed a React Native mobile application with real-time chat functionality for location-based attendance tracking. Integrated Supabase for backend services, Firebase for real-time messaging, and Expo Location API for precise geolocation. Implemented secure authentication and role-based access control for students and faculty. Achieved 95% accuracy in location verification within a 50-meter radius using GPS coordinates.',
      technologies: ['React Native', 'Supabase', 'Firebase', 'Expo'],
      category: 'Mobile App',
      year: '2024',
      achievement: '95% Accuracy',
      link: '#'
    }
  ];

  const skills = [
    { name: 'Languages', level: 90, category: 'C++, JS, TS, Python, Java' },
    { name: 'Frontend', level: 95, category: 'React, Next.js, Vue, Tailwind' },
    { name: 'Backend', level: 85, category: 'Node, Express, FastAPI' },
    { name: 'Databases', level: 80, category: 'Postgres, MySQL, Mongo' },
    { name: 'Cloud/DevOps', level: 75, category: 'AWS, Docker, CI/CD' },
    { name: 'ML', level: 80, category: 'scikit-learn, TensorFlow' }
  ];

  const experience = [
    {
      company: 'Microsoft Students Club (Open Source)',
      position: 'Lead',
      period: 'Present',
      description: 'Leading open-source initiatives, mentoring students in full-stack development, and organizing technical workshops.',
      achievements: ['Community Growth', 'OSS Mentorship', 'Workshop Org']
    },
    {
      company: 'Google Developer Student Club (GDSC)',
      position: 'Web Developer',
      period: 'Past',
      description: 'Developed and maintained web applications using React.js and Node.js. Built responsive UI components improving engagement by 40%.',
      achievements: ['40% Engagement', 'React/Node.js', 'Mentorship']
    },
    {
      company: 'Career Guidance Cell, IIIT Dharwad',
      position: 'Member',
      period: 'Past',
      description: 'Organized career workshops and developed web-based tools for tracking student career progress.',
      achievements: ['Career Tools', 'Workshop Org', 'Management']
    }
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Updated theme for black and white professional coding style
  const theme = isDarkMode ? {
    bg: 'bg-black',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    card: 'bg-gray-900',
    border: 'border-gray-800',
    accent: 'bg-white text-black',
    accentText: 'text-white',
    accentBorder: 'border-white'
  } : {
    bg: 'bg-white',
    text: 'text-black',
    textSecondary: 'text-gray-600',
    card: 'bg-gray-50',
    border: 'border-gray-200',
    accent: 'bg-black text-white',
    accentText: 'text-black',
    accentBorder: 'border-black'
  };

  // Handle form submission with EmailJS
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      await emailjs.sendForm(
        'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
        'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
        form,
        'YOUR_PUBLIC_KEY' // Replace with your EmailJS public key
      );

      setSubmitMessage({ type: 'success', text: 'Message sent successfully!' });
      form.reset();
    } catch (error) {
      console.error('Failed to send message:', error);
      setSubmitMessage({ type: 'error', text: 'Failed to send message. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-4 w-48 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen overflow-hidden ${theme.bg}`}>
      {/* Three.js container */}
      <div ref={containerRef} className="fixed inset-0 z-0" />

      {/* Mobile Header */}
      <header className={`md:hidden fixed top-0 left-0 right-0 z-50 ${theme.card} backdrop-blur-md border-b ${theme.border}`}>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <motion.button
            onClick={() => setIsDarkMode(!isDarkMode)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-2 rounded-full ${theme.accent}`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </motion.button>

          <h1 className={`text-xl font-bold ${theme.text}`}>Harshith Daraboina</h1>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 rounded-md ${theme.text}`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-16 left-0 right-0 z-40 ${theme.card} border-b ${theme.border} shadow-lg md:hidden`}
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex flex-col space-y-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`flex items-center px-4 py-3 rounded-lg transition-all ${activeSection === item.id
                        ? `${theme.accent} ${theme.accentText}`
                        : `${theme.text} hover:${theme.card}`
                        }`}
                    >
                      <Icon className="mr-3" size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Desktop Navigation */}
      <motion.nav
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className={`hidden md:flex fixed left-0 top-0 h-screen w-24 z-50 flex-col items-center justify-between py-10 ${isDarkMode ? 'bg-gray-900/90' : 'bg-white/90'} backdrop-blur-md border-r ${theme.border}`}
      >
        <div className="flex flex-col items-center space-y-10">
          {/* Logo/Initials */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center shadow-lg"
          >
            <span className="text-white font-bold text-lg">HD</span>
          </motion.div>

          {/* Navigation Items */}
          <div className="flex flex-col items-center space-y-8">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-3 rounded-xl transition-all duration-300 group ${activeSection === item.id
                    ? `${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'} shadow-lg`
                    : `${isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-200'}`
                    }`}
                >
                  <Icon size={20} />
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className={`absolute left-14 top-1/2 transform -translate-y-1/2 px-3 py-1 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} rounded-lg text-sm whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300`}
                  >
                    {item.label}
                  </motion.div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-center space-y-6">
          {/* Theme Toggle */}
          <motion.button
            onClick={() => setIsDarkMode(!isDarkMode)}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'} transition-colors`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </motion.button>

          {/* Social Links */}
          <div className="flex flex-col space-y-4">
            {[
              { icon: Github, href: 'https://github.com/Harshith-Daraboina' },
              { icon: Linkedin, href: 'https://linkedin.com/in/harshith-daraboina' },
              { icon: Mail, href: 'mailto:hithx.devs@gmail.com' }
            ].map((social, index) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-xl ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-black hover:bg-gray-300'} transition-all duration-300`}
                >
                  <Icon size={16} />
                </motion.a>
              );
            })}
          </div>

          {/* Resume Download */}
          <motion.a
            href="https://drive.google.com/file/d/10yYHzfhx9gmlWeZYmY6hl_55xIdqpTJ_/view?usp=drive_link"
            target="_blank"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-xl ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'} flex items-center justify-center`}
          >
            <FileText size={16} />
          </motion.a>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="md:ml-24 pt-16 md:pt-0 relative z-10">
        {/* Hero Section */}
        <section id="home" className="relative z-10 pt-20 pb-40">
          <div className="max-w-6xl mx-auto px-8">
            <div className="mb-32">
              <div className="mb-8">
                <p className={`text-sm tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>I BELIEVE THAT WHAT YOU WANT TO BECOME IN THE LIFE, IS WHAT ALL YOU NEED. </p>
                <h1 className={`text-6xl md:text-8xl font-light leading-tight ${theme.text} mb-8`}>
                  HARSHITH<br />
                  <span className="text-4xl md:text-6xl">DARABOINA</span>
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-6 mb-12">
                <button
                  onClick={() => scrollToSection('projects')}
                  className={`px-8 py-3 rounded-full font-medium transition-all transform hover:scale-105 shadow-lg hover:shadow-xl ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                >
                  View Projects
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className={`px-8 py-3 rounded-full font-medium border transition-all transform hover:scale-105 hover:bg-opacity-10 ${isDarkMode ? 'border-white text-white hover:bg-white' : 'border-black text-black hover:bg-black'}`}
                >
                  Contact Me
                </button>
              </div>

              {/* Typing Effect Display */}
              <div className="mb-8">
                <div className={`text-2xl font-mono tracking-wider ${theme.text}`}>
                  {displayedText}
                  <span className="animate-pulse ml-1">|</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className={`py-20 px-4 sm:px-8 ${theme.bg}`}>
          <div className="max-w-7xl mx-auto">
            {/* Main Content - Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-16 items-center min-h-[80vh]">
              {/* Image Side */}
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                {/* Glowing background effect */}
                <div className="absolute -inset-6 bg-gradient-to-r from-gray-400/10 to-gray-600/10 rounded-3xl blur-3xl"></div>

                {/* Image container */}
                <div className="relative">
                  <div className="overflow-hidden rounded-2xl shadow-2xl border border-white/10">
                    <img
                      src='/images/hero.png'
                      alt="Harshith Daraboina"
                      className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Content Side */}
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-8"
              >
                {/* Main Heading with Outline Effect */}
                <div>
                  <h3 className={`text-3xl font-bold mb-4 ${theme.text}`}>About Me</h3>
                  <p className={`${theme.textSecondary} text-lg leading-relaxed`}>
                    I am a passionate Full Stack Developer and AI Enthusiast with a knack for building scalable web applications and intelligent systems. With expertise in the MERN stack, Next.js, and Python, I transform complex problems into elegant, user-centric solutions. I am constantly exploring new technologies to push the boundaries of what's possible on the web.
                  </p>
                </div>

                {/* GitHub Stats */}
                <div className="space-y-6 flex flex-col items-center w-full">

                  <div className={`w-full p-6 rounded-2xl bg-[#0d1117] border border-[#30363d] transition-all duration-300 hover:shadow-lg flex justify-center`}>
                    {/* @ts-ignore */}
                    <GitHubCalendar
                      username="Harshith-Daraboina"
                      blockSize={13}
                      blockMargin={2}
                      fontSize={14}
                      colorScheme="dark"
                    />
                  </div>
                </div>



                {/* Skills Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 1 }}
                  className="pt-8"
                >
                  <div className="flex flex-wrap gap-3">
                    {['React', 'Next.js', 'Python', 'FastAPI', 'AI/ML'].map((skill, index) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
                        className={`px-4 py-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} rounded-full text-sm font-medium ${theme.text} hover:border-gray-400 transition-colors`}
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="py-16 sm:py-20 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className={`text-3xl sm:text-4xl font-bold ${theme.text} mb-4`}>Experience</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-gray-700 to-black mx-auto"></div>
            </motion.div>

            <div className="relative space-y-8 md:space-y-12">
              {/* Vertical Line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-700 transform md:-translate-x-1/2"></div>

              {experience.map((exp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className={`relative flex items-center md:justify-between ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Spacer for desktop alignment */}
                  <div className="hidden md:block w-5/12"></div>

                  {/* Dot on Line */}
                  <div className={`absolute left-8 md:left-1/2 w-8 h-8 rounded-full transform -translate-x-1/2 flex items-center justify-center z-10 border-4 ${isDarkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-300'}`}>
                    <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-white' : 'bg-black'}`}></div>
                  </div>

                  {/* Content Card */}
                  <div className="ml-16 md:ml-0 w-full md:w-5/12">
                    <div className={`${theme.card} p-6 rounded-xl border ${theme.border} hover:shadow-xl transition-all duration-300 relative group`}>
                      {/* Arrow/Triangle */}
                      <div className={`absolute top-6 w-4 h-4 transform rotate-45 ${theme.card} border-b ${theme.border} ${index % 2 === 0 ? '-right-2 border-r bg-inherit' : '-left-2 border-l bg-inherit'} hidden md:block z-0`}></div>

                      <div className="flex flex-col mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`text-xl font-bold ${theme.text}`}>{exp.position}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${theme.accent}`}>
                            {exp.period}
                          </span>
                        </div>
                        <h4 className="text-lg text-gray-400 font-medium">{exp.company}</h4>
                      </div>

                      <p className={`${theme.textSecondary} text-sm leading-relaxed mb-4`}>{exp.description}</p>

                      <div className="flex flex-wrap gap-2">
                        {exp.achievements.map((achievement, idx) => (
                          <span
                            key={idx}
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-600'}`}
                          >
                            {achievement}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        {/* Projects Section */}
        <section id="projects" className={`py-16 sm:py-20 px-4 sm:px-8 ${theme.bg}`}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className={`text-3xl sm:text-4xl font-bold ${theme.text} mb-4`}>Featured Projects</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-gray-700 to-black mx-auto"></div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((project, index) => (
                <SpotlightCard
                  key={project.id}
                  className={`${theme.card} rounded-xl border ${theme.border} hover:shadow-xl transition-all duration-300 flex flex-col h-full`}
                  spotlightColor="rgba(0, 229, 255, 0.2)"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col h-full"
                  >
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${theme.accent}`}>
                          {project.category}
                        </span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{project.year}</span>
                      </div>
                      <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'} mb-3`}>{project.title}</h3>
                      <p className={`text-base ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-6 flex-grow leading-relaxed font-medium`}>{project.description}</p>

                      <div className="flex flex-wrap gap-2 mt-auto">
                        {project.technologies.map(tech => (
                          <span key={tech} className={`text-xs px-2 py-1 rounded border ${isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'} font-medium`}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Proficiency / 3-Column Layout */}
        <section className="py-16 sm:py-20 px-4 sm:px-8 relative z-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className={`text-4xl md:text-5xl font-bold ${theme.text} mb-6`}>Technical Proficiency</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto opacity-50"></div>
              <p className={`mt-6 text-xl ${theme.textSecondary} max-w-2xl mx-auto leading-relaxed`}>
                Core foundations, modern execution.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch h-auto">

              {/* Column 1: Education Stack */}
              <div className="relative group h-full">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-700 to-cyan-900/50 rounded-2xl blur opacity-0 group-hover:opacity-50 transition duration-500"></div>
                <div className={`relative h-full ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl border group-hover:border-cyan-500/20 p-6 overflow-y-auto custom-scrollbar h-[500px] transition-colors duration-500`}>
                  <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-6 border-b border-gray-200/10 pb-2">Academic Timeline</h4>
                  <div className={`space-y-8 relative pl-6 border-l-2 ${isDarkMode ? 'border-slate-700/50' : 'border-gray-200'}`}>
                    {[
                      { school: "IIIT Dharwad", degree: "B.Tech CSE", score: "GPA: 8.02", detail: "University", year: "2022-2026" },
                      { school: "Narayana College", degree: "Intermediate", score: "95%", detail: "College", year: "2020-2022" },
                      { school: "KKR Gowtham School", degree: "CBSE", score: "85.4%", detail: "School", year: "2019-2020" }
                    ].map((edu, idx) => (
                      <div key={idx} className="relative group/item">
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 ${isDarkMode ? 'border-slate-900' : 'border-white ring-2 ring-gray-100'} ${idx === 0 ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-gray-400 group-hover/item:bg-cyan-500'} transition-colors duration-300`}></div>

                        {/* Content */}
                        <div className={`${isDarkMode ? 'bg-slate-800/50 border-white/5' : 'bg-gray-50 border-gray-200'} p-4 rounded-lg border hover:border-cyan-500/30 transition-colors`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider bg-cyan-500/10 px-2 py-0.5 rounded">
                              {edu.detail}
                            </span>
                            <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} font-mono`}>{edu.year}</span>
                          </div>
                          <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} leading-tight mb-1`}>{edu.school}</h4>
                          <div className="flex justify-between items-center text-sm mt-2">
                            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{edu.degree}</p>
                            <span className={`text-cyan-500 font-bold ${isDarkMode ? 'bg-slate-800 border-white/10' : 'bg-white border-gray-200'} px-2 py-1 rounded text-xs border`}>{edu.score}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 2: Achievements Stack */}
              <div className="h-full w-full">
                <div className="flex items-center gap-3 mb-6 justify-center md:justify-end">
                  <h3 className="text-xl font-bold text-white">Achievements</h3>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Achievements</h3>
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'} text-purple-400`}><ExternalLink size={20} /></div>
                </div>

                <div className="relative group h-full">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-700 to-indigo-900/50 rounded-2xl blur opacity-0 group-hover:opacity-50 transition duration-500"></div>
                  <div className={`relative h-full ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl border group-hover:border-indigo-500/20 p-6 overflow-hidden custom-scrollbar h-[500px] transition-colors duration-500 flex flex-col`}>
                    <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-6 border-b border-gray-200/10 pb-2">Key Highlights</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                      {[
                        { title: "Hack to Impact", desc: "Top 6 Finalist (90+ Teams)", highlight: "IIIT Delhi", icon: "🏆" },
                        { title: "CodeChef", desc: "Max Rating 1253 (2★)", highlight: "Competitive", icon: "⭐" },
                        { title: "LeetCode", desc: "400+ DSA Problems Solved", highlight: "Problem Solving", icon: "💻" },
                        { title: "Academic", desc: "Distinction with 8.02 GPA", highlight: "Excellence", icon: "🎓" }
                      ].map((ach, idx) => (
                        <div key={idx} className={`${isDarkMode ? 'bg-slate-900/40 border-white/5 hover:bg-slate-900/80' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'} p-4 rounded-xl border hover:border-indigo-500/20 transition-all group/card flex flex-col justify-between h-full`}>
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <span className={`${isDarkMode ? 'opacity-80' : 'opacity-100 text-gray-700'} text-2xl group-hover/card:opacity-100 transition-opacity`}>{ach.icon}</span>
                              <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider bg-indigo-500/10 px-1.5 py-0.5 rounded">{ach.highlight}</span>
                            </div>
                            <h4 className={`text-sm font-bold ${isDarkMode ? 'text-gray-200 group-hover/card:text-white' : 'text-gray-900 group-hover/card:text-black'} leading-tight mb-2 transition-colors`}>{ach.title}</h4>
                            <p className={`${isDarkMode ? 'text-gray-500 group-hover/card:text-gray-400' : 'text-gray-600 group-hover/card:text-gray-500'} text-xs leading-relaxed`}>{ach.desc}</p>
                          </div>

                          <div className="mt-auto pt-3">
                            {idx === 0 && <div className={`w-full h-1 ${isDarkMode ? 'bg-indigo-950/30' : 'bg-indigo-100'} rounded-full overflow-hidden`}><div className="h-full w-[95%] bg-indigo-500/50 group-hover/card:bg-indigo-500 transition-colors"></div></div>}
                            {idx === 1 && <div className={`w-full h-1 ${isDarkMode ? 'bg-indigo-950/30' : 'bg-indigo-100'} rounded-full overflow-hidden`}><div className="h-full w-[70%] bg-indigo-500/50 group-hover/card:bg-indigo-500 transition-colors"></div></div>}
                            {idx === 2 && <div className={`w-full h-1 ${isDarkMode ? 'bg-indigo-950/30' : 'bg-indigo-100'} rounded-full overflow-hidden`}><div className="h-full w-[85%] bg-indigo-500/50 group-hover/card:bg-indigo-500 transition-colors"></div></div>}
                            {idx === 3 && <div className={`w-full h-1 ${isDarkMode ? 'bg-indigo-950/30' : 'bg-indigo-100'} rounded-full overflow-hidden`}><div className="h-full w-[80%] bg-indigo-500/50 group-hover/card:bg-indigo-500 transition-colors"></div></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>




        {/* Contact Section */}
        <section id="contact" className={`py-16 sm:py-20 px-4 sm:px-8 relative`}>
          {isDarkMode && <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] to-black opacity-80 pointer-events-none"></div>}
          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className={`text-3xl sm:text-4xl font-bold ${theme.text} mb-4`}>Get In Touch</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-gray-700 to-black mx-auto"></div>
              <p className={`max-w-2xl mx-auto ${theme.textSecondary} mt-6`}>
                Have a project in mind or want to discuss opportunities? Feel free to reach out!
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div className={`p-6 sm:p-8 rounded-xl ${theme.card} border ${theme.border}`}>
                  <h3 className={`text-2xl font-bold ${theme.text} mb-6`}>Contact Information</h3>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${theme.accent}`}>
                        <Mail size={20} />
                      </div>
                      <div>
                        <h4 className={`font-medium ${theme.text}`}>Email</h4>
                        <a href="mailto:daraboinaharshith2005@gmail.com" className={`${theme.textSecondary} hover:text-gray-400 transition-colors`}>
                          daraboinaharshith2005@gmail.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${theme.accent}`}>
                        <Phone size={20} />
                      </div>
                      <div>
                        <h4 className={`font-medium ${theme.text}`}>Phone</h4>
                        <a href="tel:+918639066100" className={`${theme.textSecondary} hover:text-gray-400 transition-colors`}>
                          +91 8639066100
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${theme.accent}`}>
                        <MapPin size={20} />
                      </div>
                      <div>
                        <h4 className={`font-medium ${theme.text}`}>Location</h4>
                        <p className={theme.textSecondary}>Dharwad, Karnataka, India</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-700">
                    <h4 className={`font-medium ${theme.text} mb-4`}>Connect with me</h4>
                    <div className="flex gap-4">
                      {[
                        { icon: Github, href: 'https://github.com/Harshith-Daraboina' },
                        { icon: Linkedin, href: 'https://linkedin.com/in/harshith-daraboina' },
                        { icon: Mail, href: 'mailto:hithx.devs@gmail.com' }
                      ].map((social, index) => {
                        const Icon = social.icon;
                        return (
                          <motion.a
                            key={index}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-3 rounded-full ${theme.card} ${theme.text} hover:${theme.accent} hover:${theme.accentText} transition-all duration-300`}
                          >
                            <Icon size={20} />
                          </motion.a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`p-6 sm:p-8 rounded-xl ${theme.card} border ${theme.border}`}
              >
                <h3 className={`text-2xl font-bold ${theme.text} mb-6`}>Send Me a Message</h3>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className={`block ${theme.text} mb-2`}>Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className={`w-full px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${theme.border} ${theme.text} focus:outline-none focus:ring-2 focus:ring-gray-500`}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className={`block ${theme.text} mb-2`}>Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className={`w-full px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${theme.border} ${theme.text} focus:outline-none focus:ring-2 focus:ring-gray-500`}
                        placeholder="Your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className={`block ${theme.text} mb-2`}>Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      className={`w-full px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${theme.border} ${theme.text} focus:outline-none focus:ring-2 focus:ring-gray-500`}
                      placeholder="Subject"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className={`block ${theme.text} mb-2`}>Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      className={`w-full px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${theme.border} ${theme.text} focus:outline-none focus:ring-2 focus:ring-gray-500`}
                      placeholder="Your message"
                    ></textarea>
                  </div>

                  {submitMessage.text && (
                    <div className={`p-3 rounded-lg ${submitMessage.type === 'success' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                      {submitMessage.text}
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full px-6 py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50`}
                  >
                    {isSubmitting ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={`py-8 px-4 sm:px-8 border-t ${theme.border} ${theme.card}`}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className={`${theme.text} mb-4 md:mb-0 text-center md:text-left`}>
              © {new Date().getFullYear()} Harshith Daraboina. All rights reserved.
            </div>
            <div className="flex space-x-6">
              {[
                { icon: Github, href: 'https://github.com/Harshith-Daraboina' },
                { icon: Linkedin, href: 'https://linkedin.com/in/harshith-daraboina' },
                { icon: Mail, href: 'mailto:daraboinaharshith2005@gmail.com' }
              ].map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`${theme.textSecondary} hover:text-gray-400 transition-colors`}
                  >
                    <Icon size={20} />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </footer>
      </div>

      {/* Bottom Instructions */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className={`px-6 py-3 rounded-full shadow-lg border ${theme.border} ${theme.card}`}>
          <span className={`text-xs tracking-wider ${theme.textSecondary}`}>
            SCROLL TO ORBIT • MOVE TO ROTATE
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalPortfolio;