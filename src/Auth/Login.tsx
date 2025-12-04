import React, { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { Col, Container, Row, Form, InputGroup, Button, Spinner } from "react-bootstrap";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthService from "../services/common/Auth.services";

// --- CAROUSEL DATA ---
const SLIDES = [
    {
        title: "Visual Command Center",
        desc: "Dynamic graphs displaying trip volume trends and total revenue at a glance. Move from manual oversight to automated decisions.",
        img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop"
    },
    {
        title: "Unified Trip Management",
        desc: "No more switching between spreadsheets. Smart scheduling, resource allocation, and digital PODs in one secure hub.",
        img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2940&auto=format&fit=crop"
    },
    {
        title: "Financial Control & Invoicing",
        desc: "Instant visibility on trip revenue versus maintenance expenses. Generate professional PDF invoices directly from trip details.",
        img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2822&auto=format&fit=crop"
    },
    {
        title: "Military-Grade Audit Trails",
        desc: "Every change is tracked. We capture the Old vs. New Value, specific user, and timestamp for total operational accountability.",
        img: "https://images.unsplash.com/photo-1558494949-ef526b0042a0?q=80&w=2600&auto=format&fit=crop"
    }
];

// --- CUSTOM STYLES ---
const styles = {
    mainContainer: {
        overflow: 'hidden',
        minHeight: '100vh',
    },
    leftColumn: {
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        position: 'relative' as 'relative',
        zIndex: 10,
    },
    rightColumn: {
        position: 'relative' as 'relative',
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        overflow: 'hidden',
    },
    bgLayer: (imgUrl: string) => ({
        position: 'absolute' as 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url('${imgUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1s ease-in-out',
        transform: 'scale(1.05)',
    }),
    overlay: {
        position: 'absolute' as 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(to top, #0f172a 10%, rgba(15, 23, 42, 0.6) 100%)',
        zIndex: 1,
    },
    carouselContent: {
        position: 'absolute' as 'absolute',
        bottom: 0, left: 0, right: 0,
        padding: '4rem',
        zIndex: 10,
        color: 'white',
    },
    input: {
        padding: '12px 16px',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        fontSize: '15px',
    },
    primaryBtn: {
        backgroundColor: '#0f766e',
        borderColor: '#0f766e',
        padding: '12px',
        fontWeight: 600,
    },
    dot: (isActive: boolean) => ({
        height: '6px',
        width: isActive ? '32px' : '8px',
        backgroundColor: isActive ? '#ffffff' : 'rgba(255,255,255,0.4)',
        borderRadius: '4px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        border: 'none',
        padding: 0,
    })
};

interface Errors {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    // --- HOOKS MUST BE AT THE TOP OF COMPONENT ---
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/dashboard";

    // --- AUTH STATE ---
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errors, setErrors] = useState<Errors>({ email: "", password: "" });
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    // --- CAROUSEL STATE ---
    const [activeSlide, setActiveSlide] = useState<number>(0);

    // --- CAROUSEL EFFECT ---
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // --- VALIDATION LOGIC ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    const validateEmail = (value: string): string => {
        if (!value) return "Email is required";
        if (!emailRegex.test(value)) return "Please enter a valid email address";
        return "";
    };

    const validatePassword = (value: string): string => {
        if (!value) return "Password is required";
        if (!passwordRegex.test(value))
            return "Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char";
        return "";
    };

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;
        setEmail(value);
        if (submitted) setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;
        setPassword(value);
        if (submitted) setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    };

    const handleSubmit = async (e: FormEvent): Promise<void> => {
        e.preventDefault();
        setSubmitted(true);
        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);
        setErrors({ email: emailError, password: passwordError });

        if (!emailError && !passwordError) {
            setIsLoading(true);
            try {
                const response = await AuthService.login({ email, password });
                if (response.isSucess && response.value) {
                    const storedToken = localStorage.getItem('jwt_token');
                    if (storedToken) {
                        toast.success("Login successful!");
                        // Redirect to the page they were trying to access, or dashboard
                        setTimeout(() => navigate(from, { replace: true }), 1000);
                    } else {
                        toast.error("Login successful but data storage failed.");
                    }
                } else {
                    toast.error(response.error || "Login failed.");
                }
            } catch (error: any) {
                toast.error("An error occurred.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    // --- RENDER SECTION ---
    return (
        <Container fluid style={styles.mainContainer}>
            <Toaster position="top-right" />
            <Row className="g-0 h-100"> 
                
                {/* LEFT COLUMN: Form */}
                <Col lg={6} style={styles.leftColumn}>
                    <div className="w-100" style={{ maxWidth: '420px', padding: '2rem' }}>
                        
                        {/* Logo Area */}
                        <div className="d-flex align-items-center mb-5 gap-2">
                             <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                                <path d="M20 40C20 40 36 26.5 36 16C36 7.16 28.84 0 20 0C11.16 0 4 7.16 4 16C4 26.5 20 40 20 40Z" fill="#0f766e"/>
                                <path d="M20 10L25 19H15L20 10Z" fill="white"/> 
                            </svg>
                            <span className="h3 fw-bold mb-0 text-dark">MoveIQ</span>
                        </div>

                        <h1 className="fw-bold mb-2">Welcome back</h1>
                        <p className="text-muted mb-5">Enter your credentials to access your Digital Command Center.</p>

                        <Form onSubmit={handleSubmit}>
                            {/* Email Input */}
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-medium small">Work Email</Form.Label>
                                <Form.Control 
                                    type="email" 
                                    placeholder="name@company.com" 
                                    value={email}
                                    onChange={handleEmailChange}
                                    isInvalid={submitted && !!errors.email}
                                    style={styles.input}
                                    className="shadow-none rounded-3"
                                />
                                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                            </Form.Group>

                            {/* Password Input */}
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-medium small">Password</Form.Label>
                                <InputGroup hasValidation>
                                    <Form.Control 
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        isInvalid={submitted && !!errors.password}
                                        style={styles.input}
                                        className="shadow-none rounded-start-3 border-end-0"
                                    />
                                    <InputGroup.Text 
                                        className="bg-white border-start-0 rounded-end-3" 
                                        style={{ cursor: 'pointer', borderColor: submitted && errors.password ? '#dc3545' : '#e5e7eb' }}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <AiFillEyeInvisible color="#6c757d"/> : <AiFillEye color="#6c757d"/>}
                                    </InputGroup.Text>
                                    <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>

                            {/* Remember & Forgot */}
                            <div className="d-flex justify-content-between align-items-center mb-4 small">
                                <Form.Check 
                                    type="checkbox" 
                                    label="Keep me signed in" 
                                    id="rememberMe"
                                    className="text-secondary"
                                />
                                <Link to="/forgot-password" className="text-decoration-none fw-semibold" style={{ color: '#0f766e' }}>
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <Button 
                                type="submit" 
                                className="w-100 shadow-sm border-0 rounded-3" 
                                disabled={isLoading}
                                style={{ ...styles.primaryBtn, opacity: isLoading ? 0.7 : 1 }}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>
                                        Verifying...
                                    </>
                                ) : (
                                    <>Log In to Dashboard</>
                                )}
                            </Button>

                            <div className="text-center mt-4 small text-muted">
                                © 2024 MoveIQ. Secure Logistics Ecosystem.
                            </div>
                        </Form>
                    </div>
                </Col>

                {/* RIGHT COLUMN: Feature Carousel */}
                <Col lg={6} className="d-none d-lg-block p-0" style={styles.rightColumn}>
                    
                    {/* Background Image Layer */}
                    <div style={styles.bgLayer(SLIDES[activeSlide].img)}></div>
                    
                    {/* Dark Gradient Overlay */}
                    <div style={styles.overlay}></div>

                    {/* Carousel Text Content */}
                    <div style={styles.carouselContent}>
                        {/* Feature Tag */}
                        <div className="d-inline-block px-2 py-1 mb-4" style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 600, 
                            letterSpacing: '0.05em', 
                            textTransform: 'uppercase', 
                            color: '#5eead4',
                            backgroundColor: 'rgba(15, 118, 110, 0.3)', 
                            border: '1px solid rgba(20, 184, 166, 0.4)',
                            borderRadius: '9999px',
                            backdropFilter: 'blur(4px)'
                        }}>
                            Feature Spotlight
                        </div>

                        {/* Animated Text Container */}
                        <div key={activeSlide} className="animate-fade-up">
                            <h2 className="display-6 fw-bold mb-3">{SLIDES[activeSlide].title}</h2>
                            <p className="lead fw-light text-light opacity-75 mb-5" style={{ maxWidth: '85%' }}>
                                {SLIDES[activeSlide].desc}
                            </p>
                        </div>

                        {/* Navigation Dots */}
                        <div className="d-flex gap-2">
                            {SLIDES.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveSlide(index)}
                                    style={styles.dot(index === activeSlide)}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </Col>
            </Row>
            
            {/* Inline Style for Animation */}
            <style>
                {`
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-up {
                        animation: fadeInUp 0.5s ease-out forwards;
                    }
                `}
            </style>
        </Container>
    );
};

export default Login;