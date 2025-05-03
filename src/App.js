import React, { useState, useEffect, useRef} from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

function App() {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Custom cursor effect
  useEffect(() => {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    const follower = document.createElement('div');
    follower.className = 'cursor-follower';
    document.body.appendChild(follower);
    
    const moveCursor = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      
      setTimeout(() => {
        follower.style.left = `${e.clientX}px`;
        follower.style.top = `${e.clientY}px`;
      }, 100);
    };
    
    document.addEventListener('mousemove', moveCursor);
    
    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.body.removeChild(cursor);
      document.body.removeChild(follower);
    };
  }, []);

  // Create particles
  useEffect(() => {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;
    
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      const size = Math.random() * 10 + 5;
      const posX = Math.random() * 100;
      const duration = Math.random() * 10 + 5;
      const delay = Math.random() * 5;
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}%`;
      particle.style.animationDuration = `${duration}s`;
      particle.style.animationDelay = `${delay}s`;
      particle.style.opacity = Math.random() * 0.5 + 0.1;
      
      particlesContainer.appendChild(particle);
    }
  }, []);

  return (
    <Router>
      <div className="app">
        <div className="particles"></div>
        
        <header className="navbar">
          <div className="logo">Claire</div>
          <nav className="nav-links">
            {['Главная', 'Чат', 'Стажировки', 'Расписание', 'Мероприятия', 'Профиль'].map((item) => (
              <Link
                key={item}
                to={item === 'Главная' ? '/' : `/${item.toLowerCase()}`}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="nav-link"
              >
                {item}
              </Link>
            ))}
          </nav>
          <div className="profile-area">
            <select className="language-select">
              <option>US</option>
              <option>RU</option>
            </select>
            <div 
              className="profile-icon"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              👤
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/чат" element={<ChatPage />} />
          <Route path="/стажировки" element={<InternshipsPage />} />
          <Route path="/расписание" element={<SchedulePage />} />
          <Route path="/мероприятия" element={<EventsPage />} />
          <Route path="/профиль" element={<ProfilePage />} />
        </Routes>
      </div>
    </Router>
  );
}

function HomePage() {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <main className="main-content">
      <div className="text-content">
        <h1>
          Будущее <span className="gray">в</span> <br />
          ИИ <span className="black">Образовании</span>
        </h1>

        <p className="mission">
          Наша миссия — поддержка студентов на всём пути обучения с помощью ИИ.
        </p>
        
        <div className="cta-boxes">
          <Link 
            to="/чат" 
            className="box migrate"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <h3>Написать в Чат</h3>
            <p>Попробовать</p>
          </Link>
          <div 
            className="box already"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <h3>Войти в аккаунт</h3>
            <p>→</p>
          </div>
        </div>
      </div>

      <div className="sphere large-sphere"></div>
      <div className="sphere small-sphere"></div>
      <div className="sphere tiny-sphere"></div>
    </main>
  );
}

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState([
    'Как подготовиться к собеседованию?',
    'Какие технологии сейчас востребованы?',
    'Какой лучший фреймворк для React?'
  ]);
  const [isHovering, setIsHovering] = useState(false);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: Date.now(),
        text: inputValue,
        timestamp: new Date().toLocaleTimeString(),
        isUser: true
      };
      
      setMessages([...messages, newMessage]);
      setHistory([...history, inputValue]);
      setInputValue('');
      
      setTimeout(() => {
        const botResponse = {
          id: Date.now() + 1,
          text: "Это автоматический ответ на ваш запрос. В реальном приложении здесь был бы ответ ИИ.",
          timestamp: new Date().toLocaleTimeString(),
          isUser: false
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  const loadFromHistory = (text) => {
    const newMessage = {
      id: Date.now(),
      text: text,
      timestamp: new Date().toLocaleTimeString(),
      isUser: true
    };
    setMessages([...messages, newMessage]);
    
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: `Ответ на ваш предыдущий запрос "${text}"`,
        timestamp: new Date().toLocaleTimeString(),
        isUser: false
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="chat-page">
      <div className="chat-history">
        <h3>История запросов</h3>
        <div className="history-list">
          {history.map((item, index) => (
            <div 
              key={index} 
              className="history-item"
              onClick={() => loadFromHistory(item)}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {item.length > 30 ? `${item.substring(0, 30)}...` : item}
            </div>
          ))}
        </div>
      </div>
      
      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-chat">
              <h3>Чат с ИИ-ассистентом</h3>
              <p>Задайте вопрос или выберите из истории запросов</p>
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.isUser ? 'user' : 'bot'}`}
              >
                <div className="message-content">
                  {message.text}
                  <span className="message-time">{message.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="chat-input">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Введите ваш вопрос..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button 
            onClick={handleSendMessage}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};



const InternshipsPage = () => {
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [applications, setApplications] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const internships = [
    {
      id: 1,
      title: "Frontend-разработчик (React)",
      company: "TechCorp",
      logo: "🏢",
      location: "Москва / Удаленно",
      description: "Разработка пользовательских интерфейсов для корпоративных решений. Вы будете работать в команде опытных разработчиков над созданием современных веб-приложений.",
      skills: "JavaScript, React, Redux, HTML/CSS",
      spots: 3,
      salary: "от 70 000 ₽",
      duration: "3 месяца"
    },
    {
      id: 2,
      title: "Data Science стажер",
      company: "DataPro",
      logo: "📊",
      location: "Санкт-Петербург",
      description: "Анализ больших данных и построение ML-моделей для решения бизнес-задач. Работа с реальными проектами под руководством ментора.",
      skills: "Python, Pandas, NumPy, SQL",
      spots: 2,
      salary: "от 90 000 ₽",
      duration: "6 месяцев"
    },
    {
      id: 3,
      title: "Backend-разработчик (Node.js)",
      company: "WebSolutions",
      logo: "🔧",
      location: "Удаленно",
      description: "Разработка API и серверной логики для веб-приложений. Идеальная возможность для тех, кто хочет углубиться в backend-разработку.",
      skills: "Node.js, Express, MongoDB, REST API",
      spots: 5,
      salary: "от 80 000 ₽",
      duration: "4 месяца"
    }
  ];

  const internshipResults = [
    { id: 1, status: "Рассматривается", feedback: "Ваша заявка находится на рассмотрении. Результаты будут через 1-2 недели." },
    { id: 2, status: "Принято", feedback: "Поздравляем! Вы приняты на стажировку. HR-менеджер свяжется с вами в течение 3 рабочих дней." },
    { id: 3, status: "Отклонено", feedback: "К сожалению, ваша заявка отклонена. Попробуйте податься на другие позиции, соответствующие вашему опыту." }
  ];

  const handleApply = (internship) => {
    setSelectedInternship(internship);
    setCoverLetter(`Я хочу подать заявку на стажировку "${internship.title}" в компании ${internship.company}, потому что...`);
  };

  const generateCoverLetter = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setCoverLetter(`Уважаемая команда ${selectedInternship.company}!

Меня зовут [Ваше имя], и я хотел бы подать заявку на стажировку "${selectedInternship.title}".

Мои навыки в области ${selectedInternship.skills.split(', ')[0]} и мой интерес к ${selectedInternship.description.split('. ')[0].toLowerCase()} делают меня отличным кандидатом на эту позицию.

Во время моего обучения/работы я [опишите ваш соответствующий опыт]. Я уверен, что смогу внести значительный вклад в ваш проект.

Буду рад возможности обсудить, как мои навыки и опыт могут быть полезны вашей команде.

С уважением,
[Ваше имя]
[Контактная информация]`);
      setIsGenerating(false);
    }, 1500);
  };

  const submitApplication = () => {
    const newApplication = {
      internshipId: selectedInternship.id,
      title: selectedInternship.title,
      company: selectedInternship.company,
      status: "Рассматривается",
      date: new Date().toLocaleDateString('ru-RU'),
      coverLetter: coverLetter
    };
    
    setApplications([...applications, newApplication]);
    alert(`Заявка на стажировку "${selectedInternship.title}" успешно отправлена!`);
    setSelectedInternship(null);
    setCoverLetter('');
  };

  return (
    <div className="internships-page">
      <div className="internships-header">
        <h1>Доступные стажировки</h1>
        <button 
          className="results-btn"
          onClick={() => setShowResults(!showResults)}
        >
          {showResults ? "← Вернуться к стажировкам" : "Мои результаты"}
        </button>
      </div>

      {showResults ? (
        <div className="results-section">
          <h2 className="section-title">Результаты моих заявок</h2>
          {applications.length === 0 ? (
            <div className="empty-results">
              <p>У вас пока нет отправленных заявок</p>
              <button 
                className="primary-btn"
                onClick={() => setShowResults(false)}
              >
                Посмотреть стажировки
              </button>
            </div>
          ) : (
            <div className="results-list">
              {applications.map((app, index) => {
                const result = internshipResults.find(r => r.id === app.internshipId) || {};
                return (
                  <div key={index} className={`result-card ${result.status.toLowerCase()}`}>
                    <div className="result-header">
                      <h3>{app.title}</h3>
                      <span className="company">{app.company}</span>
                      <div className={`status-badge ${result.status.toLowerCase()}`}>
                        {result.status}
                      </div>
                    </div>
                    <div className="result-content">
                      <p className="feedback">{result.feedback}</p>
                      <p className="date">Дата подачи: {app.date}</p>
                      <button 
                        className="details-btn"
                        onClick={() => {
                          setSelectedInternship(internships.find(i => i.id === app.internshipId));
                          setCoverLetter(app.coverLetter);
                        }}
                      >
                        Посмотреть заявку
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="internships-container">
          <div className="internships-list">
            {internships.map(internship => (
              <div key={internship.id} className="internship-card">
                <div className="internship-header">
                  <div className="company-logo">{internship.logo}</div>
                  <div className="internship-info">
                    <h2>{internship.title}</h2>
                    <span className="company">{internship.company}</span>
                    <span className="location">{internship.location}</span>
                  </div>
                </div>
                
                <div className="internship-details">
                  <p className="description">{internship.description}</p>
                  
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Требуемые навыки:</span>
                      <span className="detail-value">{internship.skills}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Зарплата:</span>
                      <span className="detail-value salary">{internship.salary}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Длительность:</span>
                      <span className="detail-value">{internship.duration}</span>
                    </div>
                  </div>
                </div>
                
                <div className="internship-footer">
                  <div className="spots-available">
                    <span className="spots-label">Доступно мест:</span>
                    <span className="spots-count">{internship.spots}</span>
                  </div>
                  <button 
                    className="apply-btn"
                    onClick={() => handleApply(internship)}
                  >
                    Подать заявку
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedInternship && (
        <div className="application-modal">
          <div className="modal-overlay" onClick={() => setSelectedInternship(null)}></div>
          <div className="modal-content">
            <button 
              className="close-modal"
              onClick={() => setSelectedInternship(null)}
            >
              &times;
            </button>
            
            <div className="modal-header">
              <h2>Заявка на стажировку</h2>
              <div className="internship-title">{selectedInternship.title} в {selectedInternship.company}</div>
            </div>
            
            <div className="application-form">
              <div className="form-section">
                <h3 className="section-title">Сопроводительное письмо</h3>
                <p className="section-description">Расскажите, почему вы хотите пройти эту стажировку и чем можете быть полезны</p>
                
                <div className="cover-letter-editor">
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Напишите ваше сопроводительное письмо здесь..."
                    className="letter-textarea"
                  />
                  <div className="editor-toolbar">
                    <button 
                      className={`generate-btn ${isGenerating ? 'generating' : ''}`}
                      onClick={generateCoverLetter}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <span className="spinner"></span>
                          Генерация...
                        </>
                      ) : (
                        <>
                          <span className="icon">✨</span>
                          Сгенерировать письмо
                        </>
                      )}
                    </button>
                    <div className="word-count">{coverLetter.length}/1000 символов</div>
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  className="submit-btn"
                  onClick={submitApplication}
                  disabled={coverLetter.length < 50}
                >
                  Отправить заявку
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => setSelectedInternship(null)}
                >
                  Сохранить черновик
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SchedulePage = () => {
  // Состояние для текущей недели
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка расписания (в реальном приложении - API запрос)
  useEffect(() => {
    // Имитация загрузки данных
    setTimeout(() => {
      setSchedule(generateMockSchedule());
      setIsLoading(false);
    }, 800);
  }, [currentWeek]);

  // Генерация мокового расписания
  const generateMockSchedule = () => {
    const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const eventTypes = ['Лекция', 'Практика', 'Консультация', 'Самостоятельная работа'];
    const courses = ['React Advanced', 'Node.js Basics', 'Алгоритмы и структуры данных', 'Базы данных'];
    
    return days.map(day => {
      const eventsCount = Math.floor(Math.random() * 3) + 1; // 1-3 события в день
      const dayEvents = [];
      
      for (let i = 0; i < eventsCount; i++) {
        const hour = 9 + Math.floor(Math.random() * 8); // С 9 до 17
        const minutes = Math.random() > 0.5 ? 0 : 30;
        const duration = [60, 90, 120][Math.floor(Math.random() * 3)]; // 1, 1.5 или 2 часа
        
        dayEvents.push({
          id: `${day}-${i}`,
          title: courses[Math.floor(Math.random() * courses.length)],
          type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          time: `${hour}:${minutes === 0 ? '00' : minutes}`,
          duration,
          location: ['Zoom', 'Аудитория 304', 'Аудитория 412', 'Онлайн'][Math.floor(Math.random() * 4)],
          instructor: ['Иванов А.А.', 'Петрова С.И.', 'Сидоров В.В.'][Math.floor(Math.random() * 3)],
          isCompleted: Math.random() > 0.7,
          isImportant: Math.random() > 0.8
        });
      }
      
      // Сортируем события по времени
      dayEvents.sort((a, b) => a.time.localeCompare(b.time));
      
      return {
        dayName: day,
        date: new Date(), // В реальном приложении - дата дня недели
        events: dayEvents
      };
    });
  };

  // Навигация по неделям
  const prevWeek = () => {
    setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() - 7)));
    setIsLoading(true);
  };

  const nextWeek = () => {
    setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() + 7)));
    setIsLoading(true);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
    setIsLoading(true);
  };

  // Форматирование даты
  const formatDateRange = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1); // Начало недели (понедельник)
    
    const end = new Date(start);
    end.setDate(start.getDate() + 5); // Конец недели (пятница)
    
    return `${start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} - ${end.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}`;
  };

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <h1>Мое расписание</h1>
        <div className="week-navigation">
          <button onClick={prevWeek} className="nav-button">
            &lt; Предыдущая
          </button>
          <div className="current-week">
            {formatDateRange(currentWeek)}
            <button onClick={goToToday} className="today-button">
              Сегодня
            </button>
          </div>
          <button onClick={nextWeek} className="nav-button">
            Следующая &gt;
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Загрузка расписания...</p>
        </div>
      ) : (
        <div className="schedule-grid">
          {schedule.map((daySchedule) => (
            <div key={daySchedule.dayName} className="day-column">
              <div className="day-header">
                <h3>{daySchedule.dayName}</h3>
                <span className="day-date">
                  {daySchedule.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              
              <div className="events-list">
                {daySchedule.events.length > 0 ? (
                  daySchedule.events.map((event) => (
                    <div 
                      key={event.id} 
                      className={`event-card ${event.isCompleted ? 'completed' : ''} ${event.isImportant ? 'important' : ''}`}
                    >
                      <div className="event-time">
                        {event.time} - {calculateEndTime(event.time, event.duration)}
                      </div>
                      <h4 className="event-title">{event.title}</h4>
                      <div className="event-details">
                        <span className={`event-type ${event.type.toLowerCase()}`}>
                          {event.type}
                        </span>
                        <span className="event-location">
                          {event.location}
                        </span>
                      </div>
                      <div className="event-instructor">
                        Преподаватель: {event.instructor}
                      </div>
                      {event.isImportant && (
                        <div className="important-badge">Важно!</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="no-events">
                    Нет занятий
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const calculateEndTime = (startTime, duration) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + duration;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours}:${endMinutes < 10 ? '0' + endMinutes : endMinutes}`;
};

const EventsPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [expandedEvent, setExpandedEvent] = useState(null);

  const eventsData = [
    {
      id: 1,
      title: "День открытых клубов",
      date: new Date(),
      time: "10:00-16:00",
      location: "Главный холл",
      description: "Знакомство со всеми студенческими клубами университета. IT-клуб, Дебаты, Фотоклуб и другие.",
      type: "club",
      emoji: "🎭",
      seats: { total: 150, booked: 112 },
      deadline: "до 18:00",
      color: "#6366F1"
    },
    {
      id: 2,
      title: "Регистрация на сессию",
      date: new Date(Date.now() + 86400000),
      time: "09:00-17:00",
      location: "Личный кабинет",
      description: "Обязательная регистрация на летнюю экзаменационную сессию для всех курсов.",
      type: "exam",
      emoji: "📚",
      seats: { total: 500, booked: 327 },
      deadline: "до 23:59",
      color: "#EC4899"
    },
    {
      id: 3,
      title: "Мастер-класс IELTS 9.0",
      date: new Date(Date.now() + 172800000),
      time: "15:00-17:30",
      location: "Коворкинг №3",
      description: "Разбор стратегий сдачи от студента, получившего максимальный балл. Включает Q&A сессию.",
      type: "masterclass",
      emoji: "🎯",
      seats: { total: 30, booked: 28 },
      deadline: "до 12:00",
      color: "#F59E0B"
    },
    {
      id: 4,
      title: "Хакатон 'Код будущего'",
      date: new Date("2023-05-21"),
      time: "10:00-22:00",
      location: "IT-центр",
      description: "24-часовое соревнование по разработке IT-решений. Призы от технологических партнеров.",
      type: "hackathon",
      emoji: "💻",
      seats: { total: 50, booked: 49 },
      deadline: "до 20:00 20 мая",
      color: "#10B981"
    }
  ];

  const handleRegister = (id) => {
    setRegisteredEvents([...registeredEvents, id]);
    setExpandedEvent(null);
  };

  const handleExpand = (id) => {
    setExpandedEvent(expandedEvent === id ? null : id);
  };

  const upcomingEvents = eventsData.filter(e => !registeredEvents.includes(e.id));
  const myEvents = eventsData.filter(e => registeredEvents.includes(e.id));

  return (
    <div className="events-container-2">
      <header className="events-header-2">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Календарь событий
        </motion.h1>
        
        <div className="tabs-2">
          {['upcoming', 'my'].map(tab => (
            <button
              key={tab}
              className={`tab-2 ${activeTab === tab ? 'active-2' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'upcoming' ? 'Предстоящие' : 'Мои события'}
              {tab === 'my' && myEvents.length > 0 && (
                <span className="badge-2">{myEvents.length}</span>
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="events-grid-2">

      {(activeTab === 'upcoming' ? upcomingEvents : myEvents).map(event => (
          <div 
            key={event.id}
            className={`event-card-2 ${expandedEvent === event.id ? 'expanded-2' : ''}`}
            style={{ borderLeft: `4px solid ${event.color}` }}
          > <div className="event-header-2" onClick={() => handleExpand(event.id)}>
          <div className="event-emoji-2">{event.emoji}</div>
          <div className="event-main-2">
            <h3>{event.title}</h3>
            <div className="event-meta-2">
              <span>{event.date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              <span>{event.time}</span>
              <span>{event.location}</span>
            </div>
          </div>
          <div className={`event-status-2 ${event.seats.booked >= event.seats.total ? 'full-2' : ''}`}>
            {event.seats.booked >= event.seats.total ? 'Мест нет' : `${event.seats.total - event.seats.booked} мест`}
          </div>
        </div>
     <AnimatePresence>
              {expandedEvent === event.id && (
                <motion.div
                  className="event-details-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p>{event.description}</p>
                  <div className="event-footer-2">
                    <span className="deadline-2">⏳ {event.deadline}</span>
                    {activeTab === 'upcoming' && (
                      <button
                        className={`register-btn-2 ${event.seats.booked >= event.seats.total ? 'disabled-2' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegister(event.id);
                        }}
                        disabled={event.seats.booked >= event.seats.total}
                      >
                        {registeredEvents.includes(event.id) ? 'Зарегистрирован' : 'Записаться'}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};


const ProfilePage = () => {
  const [user, setUser] = useState({
    name: 'Иванов Иван',
    email: 'ivanov@university.edu',
    faculty: 'Факультет компьютерных наук',
    course: '3 курс',
    gpa: '4.8',
    skills: ['JavaScript', 'React', 'Node.js', 'Python'],
    bio: 'Заинтересован в веб-разработке и машинном обучении. Ищу стажировку на лето 2023.'
  });

  const [avatar, setAvatar] = useState(null);
  const [resume, setResume] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResume(file);
    } else {
      alert('Пожалуйста, загрузите файл в формате PDF');
    }
  };

  return (
    <motion.div
      className="profile-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="profile-header">
        <h1>Мой профиль</h1>
        <button 
          className={`edit-button ${editMode ? 'save-button' : ''}`}
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? 'Сохранить' : 'Редактировать'}
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-main">
          <div className="avatar-section">
            <div className="avatar-wrapper" onClick={() => editMode && avatarInputRef.current.click()}>
              {avatar ? (
                <img src={avatar} alt="Аватар" className="avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
              {editMode && (
                <>
                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <div className="avatar-overlay">Изменить</div>
                </>
              )}
            </div>
          </div>

          <div className="info-section">
            <div className="personal-info">
              <h2>Личная информация</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>ФИО</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="name"
                      value={user.name}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{user.name}</p>
                  )}
                </div>

                <div className="info-item">
                  <label>Email</label>
                  {editMode ? (
                    <input
                      type="email"
                      name="email"
                      value={user.email}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{user.email}</p>
                  )}
                </div>

                <div className="info-item">
                  <label>Факультет</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="faculty"
                      value={user.faculty}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{user.faculty}</p>
                  )}
                </div>

                <div className="info-item">
                  <label>Курс</label>
                  {editMode ? (
                    <select
                      name="course"
                      value={user.course}
                      onChange={handleInputChange}
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={`${num} курс`}>{num} курс</option>
                      ))}
                    </select>
                  ) : (
                    <p>{user.course}</p>
                  )}
                </div>

                <div className="info-item">
                  <label>GPA</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="gpa"
                      value={user.gpa}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{user.gpa}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bio-section">
              <h2>О себе</h2>
              {editMode ? (
                <textarea
                  name="bio"
                  value={user.bio}
                  onChange={handleInputChange}
                  className="bio-textarea"
                />
              ) : (
                <p className="bio-text">{user.bio}</p>
              )}
            </div>
          </div>
        </div>

        <div className="skills-section">
          <h2>Навыки</h2>
          <div className="skills-tags">
            {user.skills.map((skill, index) => (
              <span key={index} className="skill-tag">{skill}</span>
            ))}
            {editMode && (
              <button className="add-skill-button">+ Добавить</button>
            )}
          </div>
        </div>

        <div className="resume-section">
          <h2>Резюме</h2>
          <div className="resume-upload">
            {resume ? (
              <div className="resume-preview">
                <span className="resume-icon">📄</span>
                <div className="resume-details">
                  <span className="resume-name">{resume.name}</span>
                  <span className="resume-size">{(resume.size / 1024).toFixed(1)} KB</span>
                </div>
                <div className="resume-actions">
                  <a 
                    href={URL.createObjectURL(resume)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="view-button"
                  >
                    Просмотр
                  </a>
                  <button 
                    onClick={() => setResume(null)}
                    className="remove-button"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ) : (
              <motion.div
                className="upload-area"
                onClick={() => fileInputRef.current.click()}
                whileHover={{ scale: 1.02 }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf"
                  style={{ display: 'none' }}
                />
                <span className="upload-icon">📤</span>
                <p>Загрузите ваше резюме</p>
                <span className="file-requirements">PDF, до 5MB</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};





export default App;