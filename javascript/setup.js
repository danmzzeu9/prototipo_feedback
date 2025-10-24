document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelector('main');
    const jsonPath = './javascript/questions.json';
    let stepsData = []; 
    let currentStepIndex = 0; 
    
    const localStorageKey = 'surveyAnswers';
    let answers = {};
    
    let questionsMap = {}; 

    const loadAnswers = () => {
        const stored = localStorage.getItem(localStorageKey);
        answers = stored ? JSON.parse(stored) : {};
    };

    const saveAnswer = (stepId, questionIndex, value) => {
        if (!answers[stepId]) {
            answers[stepId] = {};
        }
        const finalValue = typeof value === 'string' ? value.trim() : value;
        
        answers[stepId][questionIndex] = finalValue;
        localStorage.setItem(localStorageKey, JSON.stringify(answers));
    };
    
    loadAnswers();
    
    const restartSurvey = () => {
        localStorage.removeItem(localStorageKey);
        answers = {};
        mainContent.innerHTML = ''; 
        currentStepIndex = 0;
        loadQuestions();
        console.log('Pesquisa reiniciada. Respostas anteriores limpas.');
    };

    const createElement = (tag, className, textContent = '') => {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (textContent) el.textContent = textContent;
        return el;
    };

    const createRatingButtons = (min, max, stepId, qIndex) => {
        const notesDiv = createElement('div', 'steps-notes');
        const savedValue = answers[stepId] ? answers[stepId][qIndex] : null;

        Array.from({ length: max - min + 1 }, (_, i) => i + min).forEach(value => {
            const button = createElement('button', 'steps-note-button', value.toString());
            button.type = 'button';
            button.dataset.value = value;
            
            if (savedValue && parseInt(savedValue) === value) {
                button.classList.add('active');
            }
            
            notesDiv.appendChild(button);
            
            button.addEventListener('click', (e) => {
                const parent = e.target.closest('.steps-notes');
                parent.querySelectorAll('.steps-note-button').forEach(btn => btn.classList.remove('active'));
                
                e.target.classList.add('active');
                
                saveAnswer(stepId, qIndex, value);
            });
        });
        return notesDiv;
    };

    const createQuestion = (data, stepId, qIndex) => {
        const questionDiv = createElement('div', 'steps-question');
        questionDiv.appendChild(createElement('p', null, data.text));

        if (data.type === 'rating') {
            questionDiv.appendChild(createRatingButtons(data.min, data.max, stepId, qIndex));
            
        } else if (data.type === 'textarea') {
            const textarea = createElement('textarea');
            textarea.placeholder = data.placeholder || 'Responda aqui...';
            
            const savedText = answers[stepId] ? answers[stepId][qIndex] : '';
            textarea.value = savedText;

            textarea.addEventListener('input', (e) => {
                saveAnswer(stepId, qIndex, e.target.value);
            });

            questionDiv.appendChild(textarea);
        }
        
        return questionDiv;
    };

    const createStepSection = (data, index) => {
        const section = createElement('section', 'steps'); 
        section.id = data.id;
        
        if (index !== currentStepIndex) {
             section.style.display = 'none';
        } else {
             section.style.display = 'flex';
        }

        const header = createElement('div', 'steps-header');
        const headerDesign = createElement('div', 'steps-header-design');
        
        const hasQuestions = data.questions && data.questions.length > 0;

        headerDesign.appendChild(createElement('span', 'steps-header-line')); 
        headerDesign.appendChild(createElement('p', 'steps-header-title-design', `0${index + 1}`));
        
        if (!hasQuestions) {
             section.classList.add('steps-thankyou');
        }
        
        header.append(
            headerDesign,
            createElement('h1', null, data.title),
            createElement('p', null, data.description)
        );
        section.appendChild(header);

        if (hasQuestions) {
            const body = createElement('div', 'steps-body');
            data.questions.forEach((q, qIndex) => body.appendChild(createQuestion(q, data.id, qIndex)));
            section.appendChild(body);
        }

        if (hasQuestions) {
            const footer = createElement('div', 'steps-footer');
            
            if (index === 0) {
                const restartButton = createElement('button', 'steps-footer-button steps-prev-button', 'Reiniciar Pesquisa');
                restartButton.type = 'button';
                restartButton.addEventListener('click', restartSurvey);
                footer.appendChild(restartButton);
            } else {
                const prevButton = createElement('button', 'steps-footer-button steps-prev-button', 'Etapa anterior');
                prevButton.type = 'button';
                prevButton.addEventListener('click', () => navigateSteps(index - 1));
                footer.appendChild(prevButton);
            }

            const nextButtonText = index === stepsData.length - 2 ? 'Finalizar' : 'Próxima etapa';
            const nextButton = createElement('button', 'steps-footer-button steps-next-button', nextButtonText);
            nextButton.type = 'button';
            nextButton.addEventListener('click', () => {
                navigateSteps(index + 1);
            });
            
            footer.appendChild(nextButton);

            section.append(footer);
        } else {
            const footer = createElement('div', 'steps-footer steps-footer-thankyou');
            const restartButton = createElement('button', 'steps-footer-button steps-prev-button', 'Nova Pesquisa');
            restartButton.type = 'button';
            restartButton.addEventListener('click', restartSurvey);
            
            footer.appendChild(restartButton);

            section.append(footer);
        }

        return section;
    };

    const validateCurrentStep = () => {
        const currentStep = stepsData[currentStepIndex];
        const stepId = currentStep.id;
        
        if (!currentStep.questions || currentStep.questions.length === 0) {
            return true; 
        }

        const requiredQuestionsCount = currentStep.questions.length;
        const currentStepAnswers = answers[stepId] || {};
        let filledCount = 0;
        
        for (let i = 0; i < requiredQuestionsCount; i++) {
            const answer = currentStepAnswers[i];
            
            if (answer !== undefined && answer !== null && (typeof answer !== 'string' || answer.trim() !== '')) {
                filledCount++;
            }
        }

        if (filledCount === requiredQuestionsCount) {
            return true;
        } else {
            return false;
        }
    };

    const formatAnswersForDisplay = (rawAnswers) => {
        const finalResults = {};
        
        for (const stepId in rawAnswers) {
            const stepTitle = stepsData.find(step => step.id === stepId)?.title || stepId;
            finalResults[stepTitle] = {};
            
            const stepAnswers = rawAnswers[stepId];
            
            for (const qIndex in stepAnswers) {
                const questionText = questionsMap[stepId] ? questionsMap[stepId][qIndex] : `Pergunta [${qIndex}]`;
                const answerValue = stepAnswers[qIndex];
                
                finalResults[stepTitle][questionText] = answerValue;
            }
        }
        return finalResults;
    };

    const navigateSteps = (newIndex) => {
        if (newIndex > currentStepIndex && newIndex < stepsData.length) {
            if (!validateCurrentStep()) {
                alert('Por favor, preencha todas as perguntas desta etapa antes de avançar.');
                return;
            }
        }
        
        if (newIndex >= 0 && newIndex < stepsData.length) {
            const steps = mainContent.querySelectorAll('.steps');
            
            if (steps[currentStepIndex]) {
                steps[currentStepIndex].style.display = 'none';
            }
            
            currentStepIndex = newIndex;
            
            if (steps[currentStepIndex]) {
                steps[currentStepIndex].style.display = 'flex';
                mainContent.scrollIntoView({ behavior: 'smooth' });
            }

            if (currentStepIndex === stepsData.length - 1) {
                const rawAnswers = JSON.parse(localStorage.getItem(localStorageKey));
                
                if (rawAnswers) {
                    const finalResults = formatAnswersForDisplay(rawAnswers);
                    alert('Pesquisa Finalizada! Respostas Coletadas:\n\n' + JSON.stringify(finalResults, null, 2));
                }
                console.log('Formulário finalizado e etapa de agradecimento exibida!');
            }
        }
    };

    const loadQuestions = async () => {
        try {
            const response = await fetch(jsonPath);
            if (!response.ok) {
                throw new Error(`Erro ao carregar o JSON: ${response.statusText}`);
            }
            stepsData = await response.json(); 
            
            questionsMap = {};
            stepsData.forEach(step => {
                if (step.questions && step.questions.length > 0) {
                    questionsMap[step.id] = step.questions.map(q => q.text);
                }
            });
            
            mainContent.innerHTML = ''; 
            
            stepsData.forEach((step, index) => {
                mainContent.appendChild(createStepSection(step, index));
            });
            
            console.log('Navegação instantânea carregada.');
            
        } catch (error) {
            console.error('Falha ao carregar as perguntas:', error);
            mainContent.innerHTML = '<p>Não foi possível carregar o formulário. Tente novamente mais tarde.</p>';
        }
    };

    loadQuestions();
});