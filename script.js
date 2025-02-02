let lastCallTime = 0;  // Temps du dernier appel API
const minInterval = 3000; // Intervalle minimum entre deux appels (en millisecondes)

function sendMessage() {
    const wordInput = document.getElementById("wordInput");
    const word = wordInput.value.trim();

    if (word) {
        const currentTime = new Date().getTime();  // Temps actuel

        // Si l'intervalle entre les appels est trop court, on ignore cette demande
        if (currentTime - lastCallTime < minInterval) {
            displayMessage("Please wait a moment before trying again.", "bot");
            return;
        }

        // Met à jour le temps du dernier appel
        lastCallTime = currentTime;

        // Afficher le message de l'utilisateur
        displayMessage(word, "user");

        // Vérifier si le mot est en français et le traduire en anglais
        detectLanguageAndTranslate(word)
            .then(translatedWord => {
                // Rechercher la définition du mot dans l'API MyMemory
                fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(translatedWord)}&langpair=fr|en`)
                    .then(response => response.json())
                    .then(data => {
                        if (!data.responseData) {
                            throw new Error('Word not found or translation failed');
                        }

                        const translatedText = data.responseData.translatedText;

                        // Afficher la traduction en anglais
                        displayMessage(`Translated word: ${translatedText}`, "bot");

                        // Après 2 secondes, traduire la réponse en français
                        setTimeout(() => {
                            translateBotResponseToFrench(translatedText);
                        }, 2000);
                    })
                    .catch(error => {
                        // Gérer l'erreur (mot non trouvé ou problème de traduction)
                        displayMessage(`Sorry, I couldn't translate the word "${word}". Please try again.`, "bot");
                    });
            })
            .catch(error => {
                displayMessage(`Sorry, I couldn't translate the word "${word}". Please try again.`, "bot");
            });

        // Vider le champ de saisie après l'envoi
        wordInput.value = '';
    }
}

function translateBotResponseToFrench(englishText) {
    const maxLength = 500;
    const parts = [];

    // Découper le texte en morceaux de 500 caractères max
    for (let i = 0; i < englishText.length; i += maxLength) {
        parts.push(englishText.substring(i, i + maxLength));
    }

    let translatedText = "";

    // Fonction pour traduire chaque partie une par une
    function translatePart(index) {
        if (index >= parts.length) {
            // Une fois toutes les parties traduites, afficher le texte final en français
            displayMessage(translatedText, "bot");
            return;
        }

        fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(parts[index])}&langpair=en|fr`)
            .then(response => response.json())
            .then(data => {
                if (data.responseData.translatedText) {
                    translatedText += data.responseData.translatedText + " ";
                }
                translatePart(index + 1); // Traduire la partie suivante
            })
            .catch(error => {
                console.error("Error translating bot response:", error);
                translatePart(index + 1); // Continuer avec la partie suivante même en cas d'erreur
            });
    }

    translatePart(0); // Lancer la traduction du premier morceau
}

function displayMessage(message, sender) {
    const chatBox = document.getElementById("chatBox");

    // Créer un élément de message
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", `${sender}-message`);
    messageElement.innerHTML = message;

    // Ajouter le message dans le chat
    chatBox.appendChild(messageElement);

    // Faire défiler le chat vers le bas
    chatBox.scrollTop = chatBox.scrollHeight;
}

function detectLanguageAndTranslate(word) {
    return new Promise((resolve, reject) => {
        // Utiliser l'API MyMemory pour traduire le mot du français vers l'anglais
        fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=fr|en`)
            .then(response => response.json())
            .then(data => {
                if (data.responseData.translatedText) {
                    resolve(data.responseData.translatedText); // Retourner le mot traduit
                } else {
                    reject('Translation failed');
                }
            })
            .catch(error => {
                reject('Translation API error');
            });
    });
}
