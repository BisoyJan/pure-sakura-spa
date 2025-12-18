'use client';

import React, { useState } from 'react';
import { useEffect, useRef } from 'react';

const SpaWebsite = () => {
	const [activeIndex, setActiveIndex] = React.useState(0);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [showBackToTop, setShowBackToTop] = useState(false);
	const [formData, setFormData] = useState({
		fullName: '',
		contactNumber: '',
		email: '',
		treatment: '',
		duration: '',
		date: '',
		time: '',
		notes: '',
	});
	const [formErrors, setFormErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [submitError, setSubmitError] = useState('');

	const servicesRef = useRef(null);

	React.useEffect(() => {
		const interval = setInterval(() => {
			if (!isPaused) {
				setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
			}
		}, 6000); // Change slide every 6 seconds
		return () => clearInterval(interval);
	}, [isPaused]);

	// Show/hide back to top button based on scroll position
	useEffect(() => {
		const handleScroll = () => {
			setShowBackToTop(window.scrollY > 500);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const scrollToSection = (id) => {
		document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
		setIsMenuOpen(false); // Close the menu after clicking a link
	};

	// Handle form input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
		// Clear error for this field when user starts typing
		if (formErrors[name]) {
			setFormErrors({
				...formErrors,
				[name]: '',
			});
		}
	};

	const generateTimeSlots = () => {
		const slots = [];
		// Business hours: 3:00 PM - 12:00 MIDNIGHT
		for (let hour = 15; hour <= 23; hour++) {
			for (let minute = 0; minute < 60; minute += 30) {
				const h12 = hour > 12 ? hour - 12 : hour;
				const m = minute === 0 ? '00' : '30';
				const ampm = hour < 12 ? 'AM' : 'PM';
				slots.push(`${h12}:${m} ${ampm}`);
			}
		}
		// Add 12:00 AM (midnight) as last slot
		slots.push('12:00 AM');
		return slots;
	};

	// Validate form data
	const validateForm = () => {
		const errors = {};
		// Full name validation
		if (!formData.fullName.trim()) {
			errors.fullName = 'Full name is required';
		}

		// Contact number validation
		if (!formData.contactNumber.trim()) {
			errors.contactNumber = 'Contact number is required';
		} else if (!/^\+?[\d\s-]{7,15}$/.test(formData.contactNumber)) {
			errors.contactNumber = 'Please enter a valid contact number';
		}

		// Email validation
		if (!formData.email.trim()) {
			errors.email = 'Email address is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			errors.email = 'Please enter a valid email address';
		}

		// Treatment validation
		if (!formData.treatment) {
			errors.treatment = 'Please select a treatment';
		}

		// Duration validation
		if (!formData.duration) {
			errors.duration = 'Please select a duration';
		}

		// Date validation
		if (!formData.date) {
			errors.date = 'Please select a date';
		}

		// Time validation
		if (!formData.time) {
			errors.time = 'Please select a time slot';
		}

		return errors;
	};

	// Updated handleSubmit function to submit booking data to Google Sheets via API route
	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validate form
		const errors = validateForm();
		if (Object.keys(errors).length > 0) {
			setFormErrors(errors);
			return;
		}

		setIsSubmitting(true);
		setSubmitError('');
		setSubmitSuccess(false);

		try {
			const response = await fetch('/api/book', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					fullName: formData.fullName,
					contactNumber: formData.contactNumber,
					emailAddress: formData.email,
					treatment: formData.treatment,
					duration: formData.duration,
					date: formData.date,
					time: formData.time,
					specialRequests: formData.notes,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				setSubmitSuccess(true);
				setFormData({
					fullName: '',
					contactNumber: '',
					email: '',
					treatment: '',
					duration: '',
					date: '',
					time: '',
					notes: '',
				});
			} else {
				setSubmitError(
					data.message || 'Failed to submit booking. Please try again later.'
				);
			}
		} catch (error) {
			setSubmitError(
				'An error occurred. Please check your connection and try again.'
			);
			console.error('Booking submission error:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	useEffect(() => {
		const options = {
			root: null,
			rootMargin: '0px',
			threshold: 0.1,
		};

		const observerCallback = (entries, observer) => {
			entries.forEach((entry, idx) => {
				// If the element is in the viewport
				if (entry.isIntersecting) {
					// Add a delay based on the index to create a sequential animation
					setTimeout(() => {
						entry.target.classList.add('animate-in');
					}, idx * 150);

					// Once animated, no need to observe anymore
					observer.unobserve(entry.target);
				}
			});
		};

		const observer = new IntersectionObserver(observerCallback, options);

		// Get all service cards and observe them
		if (servicesRef.current) {
			const serviceCards =
				servicesRef.current.querySelectorAll('.service-card');
			serviceCards.forEach((card) => {
				observer.observe(card);
			});
		}

		return () => {
			if (servicesRef.current) {
				const serviceCards =
					servicesRef.current.querySelectorAll('.service-card');
				serviceCards.forEach((card) => {
					observer.unobserve(card);
				});
			}
		};
	}, []);

	return (
		<div className="min-h-screen text-white bg-black animated-gradient">
			{/* Header with Navigation - Glass Morphism */}
			<header className="fixed top-0 left-0 right-0 z-50 glass-dark">
				<div className="container flex items-center justify-between px-4 py-4 mx-auto">
					<img
						src="/images/logo.png"
						alt="PSH Logo"
						className="w-12 h-12 rounded-full ring-2 ring-pink-500/50 hover:ring-pink-500 transition-all duration-300 hover:scale-110"
					/>
					<nav className="hidden space-x-8 md:flex items-center">
						<button
							onClick={() => scrollToSection('services')}
							className="nav-link text-lg text-gray-300 hover:text-white transition-colors pb-1">
							Services
						</button>
						<button
							onClick={() => scrollToSection('about')}
							className="nav-link text-lg text-gray-300 hover:text-white transition-colors pb-1">
							About
						</button>
						<button
							onClick={() => scrollToSection('contact')}
							className="nav-link text-lg text-gray-300 hover:text-white transition-colors pb-1">
							Contact
						</button>
						<button
							onClick={() => scrollToSection('booking')}
							className="px-6 py-2 text-lg text-white transition-all duration-300 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full hover:from-pink-600 hover:to-purple-700 hover:shadow-lg hover:shadow-pink-500/25 hover:scale-105">
							BOOK NOW
						</button>
					</nav>
					{/* Hamburger Menu for Mobile */}
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="md:hidden">
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 6h16M4 12h16m-7 6h7"
							/>
						</svg>
					</button>
				</div>
				{/* Mobile Menu */}
				{isMenuOpen && (
					<div className="md:hidden">
						<div className="flex flex-col items-center py-4 space-y-4">
							<button
								onClick={() => scrollToSection('services')}
								className="text-lg hover:text-pink-500">
								Services
							</button>
							<button
								onClick={() => scrollToSection('about')}
								className="text-lg hover:text-pink-500">
								About
							</button>
							<button
								onClick={() => scrollToSection('contact')}
								className="text-lg hover:text-pink-500">
								Contact
							</button>
							<button
								onClick={() => scrollToSection('booking')}
								className="px-6 py-2 text-lg text-white transition bg-pink-500 rounded-full hover:bg-pink-600">
								BOOK NOW
							</button>
						</div>
					</div>
				)}
			</header>

			{/* Hero Section - Enhanced responsive background implementation */}
			<div className="relative min-h-screen pt-20">
				{/* Background for all devices with picture element for better responsiveness */}
				<div className="absolute inset-0 bg-black/70">
					<picture>
						{/* Mobile-specific background image */}
						<source media="(max-width: 767px)" srcSet="/images/bg-mobile.jpg" />
						{/* Tablet-specific background image (optional) */}
						<source
							media="(max-width: 1023px)"
							srcSet="/images/bg-tablet.jpg"
						/>
						{/* Desktop background image */}
						<source media="(min-width: 1024px)" srcSet="/images/bg.jpg" />
						{/* Fallback image */}
						<img
							src="/images/bg.jpg"
							alt="Spa treatment room with cherry blossoms"
							className="object-cover object-center w-full h-full opacity-30"
						/>
					</picture>
				</div>
				<div className="absolute inset-0 flex flex-col items-center justify-center p-4 pt-24 text-center">
					{/* Logo now hidden on mobile screens, visible on medium screens and up */}
					<img
						src="/images/logo.png"
						alt="PSH Logo"
						className="hidden w-28 h-28 mb-6 rounded-full md:block float ring-4 ring-pink-500/30 shadow-2xl shadow-pink-500/20"
					/>
					<h1 className="mb-4 font-serif text-4xl tracking-wide md:text-6xl lg:text-7xl leading-tight">
						<span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-100 to-white">Pure Sakura Healing</span>
					</h1>
					<h2 className="mb-8 font-serif text-2xl md:text-3xl lg:text-4xl leading-relaxed">
						<span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-pink-400 to-purple-400">Japanese Wellness Spa</span>
					</h2>
					<p className="max-w-3xl mx-auto mb-8 leading-relaxed text-base md:text-lg lg:text-xl text-gray-300">
						Experience authentic Japanese{' '}
						<span className="relative group">
						<span className="underline decoration-pink-500 decoration-2 underline-offset-4 cursor-pointer hover:text-pink-400 transition-colors">OMOTENASHI</span>
						<span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 p-3 glass rounded-xl text-sm hidden group-hover:block z-50 w-64 text-center">
							Omotenashi is the Japanese concept of wholehearted hospitality and service.
							</span>
						</span>{' '}
						service with our carefully selected treatments designed to relax
						both your mind and body. Our certified therapists bring the essence
						of Japan to every session.
					</p>

				{/* Modern glass announcement banner */}
				<div className="relative mb-8 transform transition-all duration-500 hover:scale-105 z-10 group">
					<div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
					<div className="relative px-8 py-4 glass rounded-2xl">
						<h3 className="font-serif text-lg md:text-xl lg:text-2xl font-bold">
							<span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-white to-pink-300">✨ WALK-IN and HOME SERVICE AVAILABLE! ✨</span>
						</h3>
					</div>
				</div>

				{/* Modern gradient button */}
				<button
					onClick={() => scrollToSection('booking')}
					className="group relative px-10 py-4 text-lg font-medium transition-all duration-300 rounded-full overflow-hidden">
					<span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-[length:200%_100%] animate-shimmer"></span>
					<span className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
					<span className="relative z-10">Book Now</span>
					</button>
				</div>
			</div>

			{/* Services Section - Modern Glass Cards */}
			<section id="services" className="px-4 py-24 relative overflow-hidden">
				{/* Background decorations */}
				<div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>
				<div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
				<div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
				
				<div className="max-w-6xl mx-auto relative z-10">
					<div className="text-center mb-16">
						<span className="text-pink-500 text-sm font-medium tracking-widest uppercase mb-4 block">What We Offer</span>
						<h2 className="font-serif text-4xl md:text-5xl">
							<span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Our Massage Services</span>
						</h2>
					</div>
					<div
						ref={servicesRef}
						className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
						{services.map((service, index) => (
							<div
								key={index}
								className="relative transition-all duration-1000 ease-out transform translate-y-12 opacity-0 group service-card hover-lift">
								<div className="relative overflow-hidden rounded-2xl glass">
									<img
										src={service.image}
										alt={service.name}
										className="object-cover w-full h-64 transition-all duration-500 group-hover:scale-110"
										onError={(e) => {
											e.target.src = '/images/Massage.jpg';
										}}
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80"></div>
									<div className="absolute bottom-0 left-0 right-0 p-6">
										<h3 className="mb-2 font-serif text-xl text-white group-hover:text-pink-300 transition-colors">
											{service.name}
										</h3>
										<p className="text-gray-400 text-sm">{service.description}</p>
									</div>
									{/* Hover gradient border effect */}
									<div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{background: 'linear-gradient(135deg, rgba(236,72,153,0.3) 0%, transparent 50%, rgba(139,92,246,0.3) 100%)'}}></div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Add CSS for the animation */}
				<style jsx>{`
					.service-card.animate-in {
						opacity: 1;
						transform: translateY(0);
					}
				`}</style>
			</section>

			{/* Hot Stone Therapy Feature - Modern Design */}
			<section id="about" className="px-4 py-24 relative">
				<div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
				<div className="max-w-6xl mx-auto relative z-10">
					<div className="text-center mb-16">
						<span className="text-pink-500 text-sm font-medium tracking-widest uppercase mb-4 block">Featured Treatment</span>
						<h2 className="font-serif text-4xl md:text-5xl">
							<span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Signature Hot Stone Therapy</span>
						</h2>
					</div>
					<div className="grid items-center grid-cols-1 gap-12 md:grid-cols-2">
						<div className="relative group">
							<div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
							<img
								src="/images/massage/Hot Stone (1) (Small).jpg"
								alt="Hot stone therapy treatment"
								className="relative object-cover w-full h-auto mx-auto rounded-2xl ring-1 ring-white/10"
							/>
						</div>
						<div className="flex flex-col justify-center">
							<h3 className="mb-4 font-serif text-2xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300">
								Traditional Japanese Technique
							</h3>
							<p className="mb-8 text-gray-400 leading-relaxed">
								Our signature hot stone therapy combines smooth, heated basalt
								stones with traditional Japanese massage techniques. The warmth
								of the stones helps to relax muscles and improve circulation
								while our skilled therapists apply gentle pressure for deep
								relaxation.
							</p>
							<ul className="space-y-4">
								<li className="flex items-center group/item">
									<span className="w-8 h-8 mr-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm">✓</span>
									<span className="text-gray-300 group-hover/item:text-white transition-colors">Premium basalt stones for optimal heat retention</span>
								</li>
								<li className="flex items-center group/item">
									<span className="w-8 h-8 mr-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm">✓</span>
									<span className="text-gray-300 group-hover/item:text-white transition-colors">Authentic Japanese aromatherapy oils</span>
								</li>
								<li className="flex items-center group/item">
									<span className="w-8 h-8 mr-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm">✓</span>
									<span className="text-gray-300 group-hover/item:text-white transition-colors">Customized pressure and technique for your needs</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* Treatment Room Gallery - Modern Glass Design */}
			<section className="px-4 py-24 relative overflow-hidden">
				<div className="absolute inset-0 bg-black"></div>
				<div className="max-w-6xl mx-auto relative z-10">
					<div className="text-center mb-16">
						<span className="text-pink-500 text-sm font-medium tracking-widest uppercase mb-4 block">Gallery</span>
						<h2 className="font-serif text-4xl md:text-5xl">
							<span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Our Wellness Space</span>
						</h2>
					</div>
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
						<div className="overflow-hidden rounded-2xl group relative">
							<img
								src="/images/massage/IMG_3164.jpg"
								alt="Treatment room with cherry blossoms"
								className="object-cover w-full h-64 transition-all duration-700 md:h-80 group-hover:scale-110"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
						</div>
						<div className="overflow-hidden rounded-2xl group relative">
							<img
								src="/images/massage/IMG_3179.jpg"
								alt="Hot stone treatment setup"
								className="object-cover w-full h-64 transition-all duration-700 md:h-80 group-hover:scale-110"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
						</div>
						<div className="overflow-hidden rounded-2xl group relative sm:col-span-2 md:col-span-1">
							<img
								src="/images/massage/IMG_3191.jpg"
								alt="Spa treatment area"
								className="object-cover w-full h-64 transition-all duration-700 md:h-80 group-hover:scale-110"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
						</div>
					</div>
					<div className="mt-12 text-center">
						<p className="max-w-3xl mx-auto text-gray-400 leading-relaxed">
							Our tranquil treatment rooms feature premium massage beds, soft
							lighting, and authentic Japanese aesthetics enhanced with cherry
							blossoms. Each space is designed to transport you to the peaceful
							gardens of Japan.
						</p>
					</div>
				</div>
			</section>

			{/* Testimonial Carousel - Modern Glass Design */}
			<section className="px-4 py-24 relative">
				<div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black"></div>
				<div className="max-w-4xl mx-auto relative z-10">
					<div className="text-center mb-16">
						<span className="text-pink-500 text-sm font-medium tracking-widest uppercase mb-4 block">Testimonials</span>
						<h2 className="font-serif text-4xl md:text-5xl">
							<span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">What Our Clients Say</span>
						</h2>
					</div>

					<div 
						className="overflow-hidden"
						onMouseEnter={() => setIsPaused(true)}
						onMouseLeave={() => setIsPaused(false)}
					>
						<div className="relative">
							<div
								className="flex transition-transform duration-1000 ease-in-out"
								style={{
									transform: `translateX(-${activeIndex * 100}%)`,
								}}>
								{testimonials.map((testimonial, index) => (
									<div
										key={index}
										className="flex-shrink-0 w-full px-6 py-10 sm:px-10 sm:py-12">
										<div className="glass rounded-3xl p-8 relative overflow-hidden">
											<svg
												className="absolute text-pink-500/10 right-6 top-6"
												width="60"
												height="60"
												viewBox="0 0 24 24"
												fill="currentColor">
												<path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.956.76-3.022.66-1.065 1.515-1.867 2.558-2.403L9.373 5c-.8.396-1.56.898-2.26 1.505-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69-.346 2.04-.217 3.1c.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l.002.003zm9.124 0c0-.88-.23-1.618-.69-2.217-.326-.42-.77-.692-1.327-.817-.56-.124-1.074-.13-1.54-.022-.16-.94.09-1.95.75-3.02.66-1.06 1.514-1.86 2.557-2.4L18.49 5c-.8.396-1.555.898-2.26 1.505-.708.607-1.34 1.305-1.894 2.094-.556.79-.97 1.68-1.24 2.69-.273 1-.345 2.04-.217 3.1.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l.002.003z" />
											</svg>
											<blockquote className="relative">
												<p className="text-base text-gray-300 sm:text-lg leading-relaxed italic">
													"{testimonial.quote.replace(/"/g, '')}"
												</p>
												<footer className="mt-6 flex items-center">
													<div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
														{testimonial.name.charAt(0)}
													</div>
													<div className="ml-4">
														<p className="text-base font-semibold text-white">
															{testimonial.name}
														</p>
														<p className="text-sm text-pink-400">
															Verified Client
														</p>
													</div>
												</footer>
											</blockquote>
										</div>
									</div>
								))}
							</div>

							{/* Modern Carousel Indicators */}
							<div className="flex justify-center mt-8 space-x-3">
								{testimonials.map((_, index) => (
									<button
										key={index}
										className={`h-2 rounded-full transition-all duration-300 ${
											index === activeIndex 
												? 'bg-gradient-to-r from-pink-500 to-purple-500 w-8' 
												: 'bg-gray-600 w-2 hover:bg-gray-500'
										}`}
										onClick={() => setActiveIndex(index)}
									/>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Booking Form and Map - Modern Glass Design */}
			<section id="booking" className="px-4 py-24 relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
				<div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
				<div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
				
				<div className="max-w-6xl mx-auto relative z-10">
					<div className="text-center mb-16">
						<span className="text-pink-500 text-sm font-medium tracking-widest uppercase mb-4 block">Book Now</span>
						<h2 className="font-serif text-4xl md:text-5xl">
							<span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Reserve Your Session</span>
						</h2>
					</div>
					
					<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
						<div className="glass rounded-3xl p-8">
						{submitSuccess ? (
							<div className="text-center py-8">
								<div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center">
									<svg
										className="w-10 h-10 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M5 13l4 4L19 7"></path>
									</svg>
								</div>
								<h3 className="mb-3 font-serif text-2xl text-white">
									Booking Successful!
								</h3>
								<p className="mb-6 text-gray-300 leading-relaxed">
									Thank you for booking your session. We will contact you soon
									to confirm your appointment.
								</p>
								<button
									onClick={() => setSubmitSuccess(false)}
									className="px-8 py-3 text-white rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-pink-500/25">
									Book Another Session
								</button>
							</div>
						) : (
							<form onSubmit={handleSubmit} className="space-y-5">
								<div className="space-y-4">
									<div>
										<input
											type="text"
											name="fullName"
											value={formData.fullName}
											onChange={handleInputChange}
											placeholder="Full Name"
											className={`w-full p-4 bg-white/5 border rounded-xl focus:outline-none focus:border-pink-500 focus:bg-white/10 transition-all ${
												formErrors.fullName
													? 'border-red-500'
													: 'border-white/10'
											}`}
										/>
										{formErrors.fullName && (
											<p className="mt-2 text-sm text-red-400">
												{formErrors.fullName}
											</p>
										)}
									</div>

									<div>
										<input
											type="tel"
											name="contactNumber"
											value={formData.contactNumber}
											onChange={handleInputChange}
											placeholder="Contact Number"
											className={`w-full p-4 bg-white/5 border rounded-xl focus:outline-none focus:border-pink-500 focus:bg-white/10 transition-all ${
												formErrors.contactNumber
													? 'border-red-500'
													: 'border-white/10'
											}`}
										/>
										{formErrors.contactNumber && (
											<p className="mt-2 text-sm text-red-400">
												{formErrors.contactNumber}
											</p>
										)}
									</div>

									<div>
										<input
											type="email"
											name="email"
											value={formData.email}
											onChange={handleInputChange}
											placeholder="Email Address"
											className={`w-full p-4 bg-white/5 border rounded-xl focus:outline-none focus:border-pink-500 focus:bg-white/10 transition-all ${
												formErrors.email ? 'border-red-500' : 'border-white/10'
											}`}
										/>
										{formErrors.email && (
											<p className="mt-2 text-sm text-red-400">
												{formErrors.email}
											</p>
										)}
									</div>

									<div>
										<select
											name="treatment"
											value={formData.treatment}
											onChange={handleInputChange}
											className={`w-full p-4 bg-white/5 border rounded-xl focus:outline-none focus:border-pink-500 focus:bg-white/10 transition-all ${
												formErrors.treatment
													? 'border-red-500'
													: 'border-white/10'
											}`}>
											<option value="" className="bg-gray-900">Select Treatment</option>
											<option value="Swedish Massage" className="bg-gray-900">Swedish Massage</option>
											<option value="Shiatsu Massage" className="bg-gray-900">Shiatsu Massage</option>
											<option value="Hot Stone Therapy" className="bg-gray-900">Hot Stone Therapy</option>
											<option value="Ventosa Massage" className="bg-gray-900">Ventosa Massage</option>
											<option value="Special Signature" className="bg-gray-900">Special Signature</option>
											<option value="Foot Massage" className="bg-gray-900">Foot Massage</option>
										</select>
										{formErrors.treatment && (
											<p className="mt-2 text-sm text-red-400">
												{formErrors.treatment}
											</p>
										)}
									</div>

									{/* Date input field */}
									<div>
										<label htmlFor="date" className="block mb-2 text-sm text-gray-300">
											Select Date
										</label>
										<input
											id="date"
											type="date"
											name="date"
											value={formData.date}
											onChange={handleInputChange}
											min={new Date().toISOString().split('T')[0]}
											className={`w-full p-4 bg-white/5 border rounded-xl focus:outline-none focus:border-pink-500 focus:bg-white/10 transition-all appearance-none ${
												formErrors.date ? 'border-red-500' : 'border-white/10'
											} text-white`}
										/>
									</div>

									{/* Added treatment duration selection */}
									<div>
										<select
											name="duration"
											value={formData.duration}
											onChange={handleInputChange}
											className={`w-full p-4 bg-white/5 border rounded-xl focus:outline-none focus:border-pink-500 focus:bg-white/10 transition-all ${
												formErrors.duration
													? 'border-red-500'
													: 'border-white/10'
											}`}>
											<option value="" className="bg-gray-900">Select Duration</option>
											<option value="30mins" className="bg-gray-900">30 mins</option>
											<option value="60mins" className="bg-gray-900">60 mins</option>
											<option value="90mins" className="bg-gray-900">90 mins</option>
											<option value="120mins" className="bg-gray-900">120 mins</option>
										</select>
										{formErrors.duration && (
											<p className="mt-2 text-sm text-red-400">
												{formErrors.duration}
											</p>
										)}
									</div>

									{/* Time slot dropdown */}
									<div>
										<select
											name="time"
											value={formData.time}
											onChange={handleInputChange}
											className={`w-full p-4 bg-white/5 border rounded-xl focus:outline-none focus:border-pink-500 focus:bg-white/10 transition-all ${
												formErrors.time ? 'border-red-500' : 'border-white/10'
											}`}>
											<option value="" className="bg-gray-900">Select Time Slot</option>
											{generateTimeSlots().map((slot, index) => (
												<option key={index} value={slot} className="bg-gray-900">
													{slot}
												</option>
											))}
										</select>
										{formErrors.time && (
											<p className="mt-2 text-sm text-red-400">
												{formErrors.time}
											</p>
										)}
									</div>

									<textarea
										name="notes"
										value={formData.notes}
										onChange={handleInputChange}
										placeholder="Any special requests or notes?"
										rows={4}
										className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-pink-500 focus:bg-white/10 transition-all resize-none"
									/>
								</div>

								{submitError && (
									<div className="p-4 text-red-200 border border-red-500/50 rounded-xl bg-red-900/20">
										{submitError}
									</div>
								)}

								<button
									type="submit"
									disabled={isSubmitting}
									className="w-full py-4 text-white rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg">
									{isSubmitting ? (
										<span className="flex items-center justify-center">
											<svg
												className="w-5 h-5 mr-2 animate-spin"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24">
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"></circle>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
											Processing...
										</span>
									) : (
										'Book Your Session'
									)}
								</button>
							</form>
						)}
					</div>
					<div className="w-full h-full min-h-[400px] rounded-3xl overflow-hidden shadow-2xl">
						<iframe
							src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d331823.7402851301!2d120.66378321651236!3d14.566305186929052!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c9abc24f9f85%3A0xd920d66f8809d165!2s7829%20Makati%20Ave%2C%20Makati%2C%20Metro%20Manila!5e1!3m2!1sen!2sph!4v1739808185273!5m2!1sen!2sph"
							width="100%"
							height="100%"
							style={{ border: 0 }}
							allowFullScreen=""
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"></iframe>
					</div>
				</div>
				</div>
			</section>

			{/* Footer - Modern Glass Design */}
			<footer
				id="contact"
				className="px-4 py-16 relative overflow-hidden">
				<div className="absolute inset-0 bg-black"></div>
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></div>
				
				<div className="max-w-6xl mx-auto relative z-10">
					<div className="grid grid-cols-1 gap-12 md:grid-cols-3">
						<div className="text-center md:text-left">
							<div className="inline-block mb-6">
								<img
									src="/images/logo.png"
									alt="PSH Logo"
									className="w-24 h-24 rounded-full ring-2 ring-pink-500/30"
								/>
							</div>
							<h3 className="font-serif text-xl mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Pure Sakura Healing</h3>
							<p className="text-gray-400 leading-relaxed">
								Experience authentic Japanese wellness and healing traditions in a
								serene environment.
							</p>
						</div>
						<div className="text-center md:text-left">
							<h3 className="font-serif text-xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Contact Us</h3>
							<ul className="space-y-4 text-gray-400">
								<li className="flex items-center justify-center md:justify-start gap-3 group">
									<div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
										<svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
											<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
											<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
										</svg>
									</div>
									<a href="mailto:pshealing250@gmail.com" className="hover:text-pink-400 transition">pshealing250@gmail.com</a>
								</li>
								<li className="flex items-center justify-center md:justify-start gap-3 group">
									<div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
										<svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
											<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
										</svg>
									</div>
									<a href="tel:+639628463588" className="hover:text-pink-400 transition">0962 846 3588</a>
								</li>
								<li className="flex items-start justify-center md:justify-start gap-3">
									<div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center flex-shrink-0 mt-1">
										<svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
										</svg>
									</div>
									<span className="text-sm leading-relaxed">Unit 1439, 14th Flr, Centuria Medical Makati, Century City, Brgy. Poblacion, Kalayaan Avenue, Makati City</span>
								</li>
								<li className="flex items-center justify-center md:justify-start gap-3">
									<div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center">
										<svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
										</svg>
									</div>
									<span className="text-pink-400 font-medium">3:00 PM - 12:00 MIDNIGHT</span>
								</li>
							</ul>
						</div>
						<div className="text-center md:text-left">
							<h3 className="font-serif text-xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Follow Us</h3>
							<div className="flex justify-center mb-8 space-x-4 md:justify-start">
								<a
									href="https://www.facebook.com/profile.php?id=61564680055891"
									className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-pink-500/20 hover:border-pink-500/50 transition-all duration-300 group">
									<svg
										className="w-5 h-5 text-gray-400 group-hover:text-pink-400 transition-colors"
										fill="currentColor"
										viewBox="0 0 24 24">
										<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
									</svg>
								</a>
								<a
									href="https://www.instagram.com/pshealing"
									className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-pink-500/20 hover:border-pink-500/50 transition-all duration-300 group">
									<svg
										className="w-5 h-5 text-gray-400 group-hover:text-pink-400 transition-colors"
										fill="currentColor"
										viewBox="0 0 24 24">
										<path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
									</svg>
								</a>
							</div>
							<div className="glass rounded-2xl p-4 text-center">
								<p className="text-sm text-gray-400">
									&copy; {new Date().getFullYear()} Pure Sakura Healing
								</p>
								<p className="text-xs text-gray-500 mt-1">All rights reserved</p>
							</div>
						</div>
					</div>
				</div>
			</footer>

			{/* Back to Top Button - Modern Design */}
			{showBackToTop && (
				<button
					onClick={scrollToTop}
					className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white flex items-center justify-center shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:scale-110 group"
					aria-label="Back to top"
				>
					<svg className="w-5 h-5 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
					</svg>
				</button>
			)}
		</div>
	);
};

const services = [
	{
		name: 'Swedish Massage',
		description:
			'Traditional oil massage for deep relaxation and improved circulation.',
		image: '/images/massage/SWEDISH (1).jpg',
	},
	{
		name: 'Shiatsu Massage',
		description:
			'Japanese pressure point therapy to balance energy flow and reduce stress.',
		image: '/images/massage/SHIATSU (2).jpg',
	},
	{
		name: 'Hot Stone Therapy',
		description:
			'Premium hot stone massage with authentic Japanese techniques for ultimate relaxation.',
		image: '/images/massage/Hot Stone (1).jpg',
	},
	{
		name: 'Ventosa Massage',
		description:
			'Utilizes heated cups to create suction, providing muscle relief and enhancing blood flow.',
		image: '/images/massage/VENTOSA (1).jpg',
	},
	{
		name: 'Special Signature',
		description:
			'Our signature treatment combining multiple techniques with sakura-infused products.',
		image: '/images/massage/SPECIAL SIGNATURE.jpg',
	},
	{
		name: 'Foot Massage',
		description:
			'Relieves tension and improves circulation through targeted pressure points.',
		image: '/images/massage/Foot Massage.jpg',
	},
];

const testimonials = [
	{
		name: 'Nuk Herzfled',
		quote:
			'"I went there today for my first Swedish massage and my masseuse was called Wendy. The massage facilities are very clean and the material is good so you can lie down comfortably. All the staff are very friendly and I have never had a better massage. I am already looking forward to future visits."',
	},
	{
		name: 'Myla Jean Sari',
		quote:
			'I recently had the pleasure of visiting Pure Sakura Healing Wellness Spa, and I must say it was an absolute haven for the mind, body, and soul. I was greeted with warm hospitality, a truly relaxing experience.',
	},
	{
		name: 'Rommnick Caldosa',
		quote:
			'I had the pleasure of visiting Pure Sakura Healing Wellness Spa for the first time and I did not regret it! From the moment I walked in, the atmosphere was serene and calming. The staff were incredibly welcoming and professional. My massage therapist was fantastic, very skilled and attentive to my needs. The traditional Japanese techniques they use really helped relieve the tension in my back and shoulders, and I felt rejuvenated afterward. I will definitely be returning!',
	},
	{
		name: 'Daniella TG',
		quote:
			'It was my first time there, but my experience feels like im already a regular customer. The place is so relaxing and the staff are very accommodating. I will definitely come back and recommend this place to my friends.',
	},
	{
		name: 'Veronica Sabitian',
		quote:
			'If you’re looking for a place where you can relax and rejuvenate, this is definitely your best choice. Aside from the superb massage therapists, their customer service is top tier!!! They make sure that you leave with a smile on your face. The place smells soo good and super clean. The whole vibe feels like you’re in Japan. This is exactly what’s worthy spending on. Will definitely come back!',
	},
	{
		name: 'Samrawit Tesfatsion',
		quote:
			'I had an amazing 90-minute hot stone massage that fully relaxed my muscles. Thoughtful details like extra rest time, green tea, and a snack enhanced the experience. The staff was welcoming, and the service was excellent for the price. Highly recommended!',
	},
];

export default SpaWebsite;
