import { useState } from 'react';

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#services', label: 'Services' },
  { href: '#enquiry', label: 'Enquiry' },
  { href: '#contact', label: 'Contact' }
];

const serviceCards = [
  {
    id: 'tour',
    icon: '🎫',
    title: 'Tour Packages',
    description: 'Explore beautiful destinations with our curated tour packages.'
  },
  {
    id: 'cab',
    icon: '🚕',
    title: 'Cab Services',
    description: 'Comfortable and affordable taxi rides across the city.'
  },
  {
    id: 'bus',
    icon: '🚌',
    title: 'Bus Booking',
    description: 'Long-distance and intercity bus travel at great prices.'
  }
];

const destinations = ['Munnar', 'Kochi', 'Wayanad', 'Kumarakom', 'Goa', 'Jaipur', 'Other'];
const durations = ['2-3 days', '4-5 days', '6-7 days', '8-10 days', '10+ days'];
const budgets = ['Below ₹5,000', '₹5,000 - ₹10,000', '₹10,000 - ₹20,000', '₹20,000+'];
const vehicleTypes = ['Any Type', 'Economy', 'Comfort (AC)', 'Premium (Luxury)'];
const cities = ['Kozhikode', 'Kochi', 'Thiruvananthapuram', 'Bangalore', 'Chennai', 'Hyderabad', 'Other'];
const contactSubjects = ['General Enquiry', 'Booking Help', 'Complaint', 'Partnership', 'Other'];

const apiBase = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || '';

function App() {
  const [navOpen, setNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tour');
  const [successMessages, setSuccessMessages] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleNav = () => setNavOpen((value) => !value);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setNavOpen(false);
    const section = document.getElementById('enquiry');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearMessage = (key) => {
    setSuccessMessages((prev) => ({ ...prev, [key]: '' }));
  };

  const submitEnquiry = async (data, key) => {
    const endpoint = `${apiBase}${data.type === 'Contact Message' ? '/api/contact' : '/api/enquiries'}`;
    setIsSubmitting(true);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.message || 'Unable to submit form.');
        return false;
      }

      setSuccessMessages((prev) => ({
        ...prev,
        [key]: '✓ Your enquiry has been submitted successfully! We will contact you soon.'
      }));

      setTimeout(() => clearMessage(key), 5000);
      return true;
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Network error. Please try again later.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (event, type) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const data = {
      type,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      special_requests: formData.get('special_requests'),
      submitted_at: new Date().toISOString()
    };

    if (type === 'Tour Package') {
      Object.assign(data, {
        num_travelers: formData.get('num_travelers'),
        destination: formData.get('destination'),
        duration: formData.get('duration'),
        travel_date: formData.get('travel_date'),
        budget: formData.get('budget')
      });
    }

    if (type === 'Cab Service') {
      Object.assign(data, {
        num_passengers: formData.get('num_passengers'),
        pickup_location: formData.get('pickup_location'),
        dropoff_location: formData.get('dropoff_location'),
        travel_date: formData.get('travel_date'),
        travel_time: formData.get('travel_time'),
        vehicle_type: formData.get('vehicle_type')
      });
    }

    if (type === 'Bus Booking') {
      Object.assign(data, {
        num_passengers: formData.get('num_passengers'),
        departure_city: formData.get('departure_city'),
        destination_city: formData.get('destination_city'),
        travel_date: formData.get('travel_date'),
        return_date: formData.get('return_date'),
        bus_type: formData.get('bus_type')
      });
    }

    if (type === 'Contact Message') {
      Object.assign(data, {
        subject: formData.get('subject'),
        message: formData.get('message')
      });
    }

    const submitted = await submitEnquiry(
      data,
      type === 'Contact Message' ? 'contact' : type.toLowerCase()
    );

    if (submitted) {
      form.reset();
    }
  };

  return (
    <>
      <header>
        <nav className={navOpen ? 'open' : ''}>
          <div className="logo">
            <img src="/assets/logo.png" alt="Majestic Holidays Logo" />
          </div>
          <button
            className="nav-toggle"
            aria-label="Toggle navigation"
            aria-expanded={navOpen}
            onClick={toggleNav}
          >
            <span />
            <span />
            <span />
          </button>
          <ul>
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setNavOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <section className="hero" id="home">
        <div className="container">
          <h1>Your Journey, Our Priority</h1>
          <p>Book tours, cabs, and buses with confidence. Best prices, reliable service.</p>
          <button
            className="cta-button"
            onClick={() => document.getElementById('enquiry')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Send Enquiry Now
          </button>
        </div>
      </section>

      <section className="services" id="services">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            {serviceCards.map((service) => (
              <div key={service.id} className="service-card" onClick={() => handleTabChange(service.id)}>
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <button className="cta-button" style={{ background: 'var(--secondary-color)' }} type="button">
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="enquiry" style={{ padding: '4rem 0', background: 'var(--bg-light)' }}>
        <div className="container">
          <h2 className="section-title">Send Us Your Enquiry</h2>
          <div className="tabs">
            {serviceCards.map((service) => (
              <button
                key={service.id}
                type="button"
                className={activeTab === service.id ? 'tab-button active' : 'tab-button'}
                onClick={() => setActiveTab(service.id)}
              >
                {service.icon} {service.title.replace(' Booking', '')}
              </button>
            ))}
          </div>

          <div id="tour-form" className={activeTab === 'tour' ? 'tab-content active' : 'tab-content'}>
            <div className="form-container">
              <div className={successMessages.tour ? 'success-message show' : 'success-message'}>
                {successMessages.tour}
              </div>
              <form onSubmit={(event) => handleFormSubmit(event, 'Tour Package')}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" name="name" required />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" name="email" required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input type="tel" name="phone" placeholder="+91-XXXXXXXXXX" required />
                  </div>
                  <div className="form-group">
                    <label>Number of Travelers *</label>
                    <input type="number" name="num_travelers" min="1" required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Destination *</label>
                    <select name="destination" required>
                      <option value="">Select Destination</option>
                      {destinations.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tour Duration *</label>
                    <select name="duration" required>
                      <option value="">Select Duration</option>
                      {durations.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Preferred Travel Date *</label>
                    <input type="date" name="travel_date" required />
                  </div>
                  <div className="form-group">
                    <label>Budget Range (per person)</label>
                    <select name="budget">
                      <option value="">Select Budget</option>
                      {budgets.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Special Requirements / Preferences</label>
                  <textarea name="special_requests" placeholder="Tell us about your preferences, dietary restrictions, adventure activities, etc."></textarea>
                </div>

                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Submit Enquiry'}
                </button>
              </form>
            </div>
          </div>

          <div id="cab-form" className={activeTab === 'cab' ? 'tab-content active' : 'tab-content'}>
            <div className="form-container">
              <div className={successMessages.cab ? 'success-message show' : 'success-message'}>
                {successMessages.cab}
              </div>
              <form onSubmit={(event) => handleFormSubmit(event, 'Cab Service')}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" name="name" required />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" name="email" required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input type="tel" name="phone" placeholder="+91-XXXXXXXXXX" required />
                  </div>
                  <div className="form-group">
                    <label>Number of Passengers *</label>
                    <input type="number" name="num_passengers" min="1" max="6" required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Pickup Location *</label>
                    <input type="text" name="pickup_location" placeholder="Enter pickup address" required />
                  </div>
                  <div className="form-group">
                    <label>Drop Location *</label>
                    <input type="text" name="dropoff_location" placeholder="Enter drop address" required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Travel Date *</label>
                    <input type="date" name="travel_date" required />
                  </div>
                  <div className="form-group">
                    <label>Preferred Time *</label>
                    <input type="time" name="travel_time" required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Vehicle Type Preference</label>
                    <select name="vehicle_type">
                      {vehicleTypes.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Special Requests</label>
                  <textarea name="special_requests" placeholder="Any special requirements? (e.g., baby seat, wheelchair accessibility, etc.)"></textarea>
                </div>

                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Submit Enquiry'}
                </button>
              </form>
            </div>
          </div>

          <div id="bus-form" className={activeTab === 'bus' ? 'tab-content active' : 'tab-content'}>
            <div className="form-container">
              <div className={successMessages.bus ? 'success-message show' : 'success-message'}>
                {successMessages.bus}
              </div>
              <form onSubmit={(event) => handleFormSubmit(event, 'Bus Booking')}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" name="name" required />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" name="email" required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input type="tel" name="phone" placeholder="+91-XXXXXXXXXX" required />
                  </div>
                  <div className="form-group">
                    <label>Number of Passengers *</label>
                    <input type="number" name="num_passengers" min="1" max="60" required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Departure City *</label>
                    <select name="departure_city" required>
                      <option value="">Select City</option>
                      {cities.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Destination City *</label>
                    <select name="destination_city" required>
                      <option value="">Select City</option>
                      {cities.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Travel Date *</label>
                    <input type="date" name="travel_date" required />
                  </div>
                  <div className="form-group">
                    <label>Return Date (if applicable)</label>
                    <input type="date" name="return_date" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Bus Type Preference</label>
                    <select name="bus_type">
                      <option value="">Any Type</option>
                      <option value="AC">AC Bus</option>
                      <option value="Non-AC">Non-AC Bus</option>
                      <option value="Sleeper">Sleeper Bus</option>
                      <option value="Luxury">Luxury Bus</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Special Requests</label>
                  <textarea name="special_requests" placeholder="Any special requirements? (e.g., group discount, meal preferences, etc.)"></textarea>
                </div>

                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Submit Enquiry'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 className="section-title">Get In Touch</h2>
          <div className="contact-content">
            <div className="contact-info">
              <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Contact Us</h3>

              <div className="contact-item">
                <div className="contact-icon">📍</div>
                <div>
                  <h4>Office Address</h4>
                  <p>
                    Majestic Holidays Head Office<br />
                    Kakkodi Chelapram Rd<br />
                    Building No: 231, Kozhikode<br />
                    Kerala 673611, India
                  </p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">📞</div>
                <div>
                  <h4>Phone Numbers</h4>
                  <p>Landline: <a href="tel:+9104952961996">+91-04952-961-996</a></p>
                  <p>Support: <a href="tel:+919746680814">+91-9746-680-814</a></p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">✉️</div>
                <div>
                  <h4>Email Addresses</h4>
                  <p>Enquiries: <a href="mailto:majestickakkodi@gmail.com">majestickakkodi@gmail.com</a></p>
                  <p>Support: <a href="mailto:majesticcommunication9@gmail.com">majesticcommunication9@gmail.com</a></p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">🕐</div>
                <div>
                  <h4>Working Hours</h4>
                  <p>
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday: 10:00 AM - 4:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">💬</div>
                <div>
                  <h4>Live Chat</h4>
                  <p>Available Monday - Saturday<br />
                    9:00 AM - 5:00 PM IST
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>Follow Us</h4>
                <div className="social-links">
                  <a href="https://www.facebook.com/majestic.holidays.411208" target="_blank" rel="noreferrer" className="social-link" title="Facebook">f</a>
                  <a href="#" className="social-link" title="Instagram">📷</a>
                  <a href="https://wa.me/919746680814" target="_blank" rel="noreferrer" className="social-link whatsapp" title="WhatsApp">
                    <img src="/assets/whatsapp.png" alt="WhatsApp" width="24" height="24" />
                  </a>
                </div>
              </div>
            </div>

            <div className="form-container">
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>Send us a Message</h3>
              <div className={successMessages.contact ? 'success-message show' : 'success-message'}>
                {successMessages.contact}
              </div>
              <form onSubmit={(event) => handleFormSubmit(event, 'Contact Message')}>
                <div className="form-group">
                  <label>Your Name *</label>
                  <input type="text" name="name" required />
                </div>

                <div className="form-group">
                  <label>Your Email</label>
                  <input type="email" name="email" />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" placeholder="+91-XXXXXXXXXX" />
                </div>

                <div className="form-group">
                  <label>Subject *</label>
                  <select name="subject" required>
                    <option value="">Select Subject</option>
                    {contactSubjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea name="message" placeholder="Write your message here..." required></textarea>
                </div>

                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials" id="testimonials">
        <div className="container">
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="testimonial-grid">
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>"Amazing service! The tour package to Munnar was perfectly organized. Highly recommended!"</p>
              <div className="testimonial-author">- Rajesh Kumar</div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>"Great cab service. Driver was courteous and the vehicle was clean. Will definitely use again."</p>
              <div className="testimonial-author">- Priya Sharma</div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★☆</div>
              <p>"Bus tickets booked easily online. Comfortable journey and helpful staff. Worth the money!"</p>
              <div className="testimonial-author">- Amit Patel</div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>"Best travel agency in town! Quick response to queries and excellent customer service."</p>
              <div className="testimonial-author">- Sarah Johnson</div>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>About Us</h4>
              <ul>
                <li><a href="#">Our Story</a></li>
                <li><a href="#">Why Choose Us</a></li>
                <li><a href="#">Team</a></li>
                <li><a href="#">Careers</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Services</h4>
              <ul>
                <li><a href="#services">Tour Packages</a></li>
                <li><a href="#services">Cab Booking</a></li>
                <li><a href="#services">Bus Booking</a></li>
                <li><a href="#services">Special Offers</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Cancellation Policy</a></li>
                <li><a href="#">Terms & Conditions</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Cookie Policy</a></li>
                <li><a href="#">Disclaimer</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 Majestic Holidays. All rights reserved. | Designed with ❤️ for travelers</p>
          </div>
        </div>
      </footer>

      <div className="mobile-contact-actions" aria-label="Quick contact">
        <a
          className="mobile-contact-action whatsapp-action"
          href="https://wa.me/919746680814"
          target="_blank"
          rel="noreferrer"
          aria-label="Chat with us on WhatsApp"
        >
          <img src="/assets/whatsapp.png" alt="" width="22" height="22" />
          <span>WhatsApp</span>
        </a>
        <a
          className="mobile-contact-action call-action"
          href="tel:+919746680814"
          aria-label="Call our support team"
        >
          <span aria-hidden="true">📞</span>
          <span>Call Us</span>
        </a>
      </div>
    </>
  );
}

export default App;
