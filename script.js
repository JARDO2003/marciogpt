function sendMessage() {
    const wordInput = document.getElementById("wordInput");
    let userText = wordInput.value.trim().toLowerCase();

    if (userText) {
        displayMessage(userText, "user");

        const predefinedResponses = {
            "bonjour": "Bonjour, que puis-je pour vous ?",
            "bonsoir": "Bonsoir, que puis-je pour vous ?",
            "salut": "Salut, que puis-je pour vous ?",
            "norbert": "MANPKLIN NORBERT, professeur certifié à l'UTT Loko, mathématicien chercheur.",
            "manpklin": "MANPKLIN NORBERT, professeur certifié à l'UTT Loko, mathématicien chercheur.",
            "djinan": "OBOU Claude Cyrille, étudiant le plus brillant de Loko.",
            "étudiant le plus brillant de l'utt loko": "OBOU Claude Cyrille, étudiant le plus brillant de Loko.",
            "géreur de marasse": "OBOU Claude Cyrille, étudiant le plus brillant de Loko.",
            "mathieu": "ANDRIN MATHIEU étudiant le plus brillant de Loko, encore connu sous le nom de Géreur de marasse.",
            "issouf": "Msr TRAORE ISSOUF connu sous le nom de DJINAN représente un modèle brillant pour l'utt loko."
            "cheick": "Msr TRAORE CHEICK encore connu sous le nom du djassaman est un homme d'affaire, étudiant au groupe loko."
        "marcio": "Msr ZINZINDOHOUE MARCIO JARDEL propriétaire et créateur de MARCIO-GPT IA, passionner dans le domaine du codage il est aussi l'un des étudiant du groupe loko."
        "cissé": "CISSE TINTO est l'une des plus meilleure étudiante du groupe loko, un des modèles les plus rare ."
        "awa": "AWA TRAORE est l'une des meilleures étudiante du groupe loko, belle rayonnante et un visage toujours souriante ."
        };

        if (predefinedResponses[userText]) {
            displayMessage(predefinedResponses[userText], "bot");
        } else {
            const lastWord = extractLastWord(userText);
            if (lastWord) {
                translateToEnglish(lastWord)
                    .then(translatedText => {
                        fetchDefinition(translatedText);
                    })
                    .catch(error => {
                        displayMessage("Désolé, une erreur s'est produite avec la traduction.", "bot");
                    });
            } else {
                displayMessage("Désolé, je n'ai pas compris votre demande.", "bot");
            }
        }

        wordInput.value = '';
    }
}

function extractLastWord(text) {
    // Supprime la ponctuation à la fin de la phrase et divise en mots
    const words = text.replace(/[.,!?;:]/g, "").split(/\s+/);
    return words.length > 0 ? words[words.length - 1] : "";
}

function translateToEnglish(text) {
    return fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=en&dt=t&q=${encodeURIComponent(text)}`)
        .then(response => response.json())
        .then(data => data[0].map(item => item[0]).join(' '))
        .catch(error => {
            console.error('Erreur de traduction :', error);
            throw error;
        });
}

function fetchDefinition(word) {
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Mot non trouvé');
            }
            return response.json();
        })
        .then(data => {
            const wordData = data[0];
            const definition = wordData.meanings.map(meaning => 
                meaning.definitions.map(def => `<b>${def.definition}</b>`).join('<br>')
            ).join('<br><br>');
            const phonetic = wordData.phonetic || 'Non disponible';
            const audio = wordData.phonetics[0]?.audio || '';

            const botResponse = `
                Définition : <br>${definition}<br><br>
                Phonétique : ${phonetic}<br>
                ${audio ? `<audio controls><source src="${audio}" type="audio/mp3"></audio>` : ''}
            `;

            translateBotResponseToFrench(botResponse);
        })
        .catch(error => {
            displayMessage(`Désolé, je n'ai pas trouvé le mot "${word}". Veuillez réessayer.`, "bot");
        });
}

function translateBotResponseToFrench(text) {
    fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=fr&dt=t&q=${encodeURIComponent(text)}`)
        .then(response => response.json())
        .then(data => {
            const translatedText = data[0].map(item => item[0]).join(' ');
            displayMessage(translatedText, "bot");
        })
        .catch(error => {
            console.error('Erreur de traduction :', error);
            displayMessage("Désolé, une erreur s'est produite avec la traduction.", "bot");
        });
}

function displayMessage(message, sender) {
    const chatBox = document.getElementById("chatBox");
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", `${sender}-message`);
    messageElement.innerHTML = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById("wordInput").addEventListener("keypress", function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
