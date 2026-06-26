document.addEventListener('DOMContentLoaded', () => {
  // --- GAME CONSTANTS ---
  const snakes = {
    17: 7,
    35: 15,
    43: 22,
    49: 12
  };

  const ladders = {
    4: 14,
    9: 31,
    20: 38,
    28: 47
  };

  const questionsBank = [
    { q: "Siapa presiden pertama Republik Indonesia?", o: ["Ir. Soekarno", "Mohammad Hatta", "Soeharto", "B.J. Habibie"], a: 0 },
    { q: "Planet terdekat dari Matahari adalah...", o: ["Venus", "Mars", "Merkurius", "Bumi"], a: 2 },
    { q: "Hewan mamalia terbesar di dunia adalah...", o: ["Gajah", "Jerapah", "Hiu Megalodon", "Paus Biru"], a: 3 },
    { q: "Benua terbesar di dunia adalah...", o: ["Afrika", "Amerika", "Eropa", "Asia"], a: 3 },
    { q: "Bahan dasar pembuatan cokelat adalah...", o: ["Gandum", "Kedelai", "Kakao", "Kelapa"], a: 2 },
    { q: "Lagu kebangsaan Indonesia adalah...", o: ["Hari Merdeka", "Indonesia Raya", "Bagimu Negeri", "Tanah Airku"], a: 1 },
    { q: "Mata uang negara Jepang adalah...", o: ["Won", "Yen", "Ringgit", "Dollar"], a: 1 },
    { q: "Rumah adat Sumatera Barat terkenal dengan nama...", o: ["Rumah Joglo", "Rumah Honai", "Rumah Gadang", "Rumah Limas"], a: 2 },
    { q: "Gunung tertinggi di dunia adalah...", o: ["Gunung Fuji", "Gunung Kilimanjaro", "Gunung Rinjani", "Gunung Everest"], a: 3 },
    { q: "Warna bendera negara Indonesia adalah...", o: ["Merah Kuning Hijau", "Merah Putih", "Merah Putih Biru", "Putih Merah"], a: 1 },
    { q: "Candi Borobudur terletak di provinsi...", o: ["Jawa Timur", "Jawa Barat", "DI Yogyakarta", "Jawa Tengah"], a: 3 },
    { q: "Lambang negara Indonesia adalah...", o: ["Burung Garuda", "Harimau Sumatra", "Komodo", "Gajah Mada"], a: 0 },
    { q: "Berapakah hasil dari 12 dikali 5?", o: ["50", "55", "60", "65"], a: 2 },
    { q: "Vitamin yang paling banyak terkandung dalam buah jeruk adalah...", o: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], a: 2 },
    { q: "Samudra terluas di dunia adalah...", o: ["Samudra Atlantik", "Samudra Hindia", "Samudra Pasifik", "Samudra Arktik"], a: 2 },
    { q: "Alat pernapasan pada ikan adalah...", o: ["Paru-paru", "Trakea", "Kulit", "Insang"], a: 3 }
  ];

  // --- STATE VARIABLES ---
  let playerCount = 2;
  let players = [];
  let currentPlayerIndex = 0;
  let gameActive = false;
  let isRolling = false; // To prevent double-clicking during roll simulation

  // --- DOM SELECTORS ---
  const setupScreen = document.getElementById('setup-screen');
  const gameScreen = document.getElementById('game-screen');
  const boardGrid = document.getElementById('board-grid');
  const boardSvg = document.getElementById('board-svg');
  const playerSelector = document.getElementById('player-selector');
  const namesInputsContainer = document.getElementById('names-inputs-container');
  const startGameBtn = document.getElementById('start-game-btn');
  
  const currentIndicator = document.getElementById('current-player-indicator');
  const currentPlayerDisplay = document.getElementById('current-player-display');
  const rollDiceBtn = document.getElementById('roll-dice-btn');
  const diceVisual = document.getElementById('dice-visual');
  const diceResultText = document.getElementById('dice-result-text');
  const playerStatusList = document.getElementById('player-status-list');
  
  const victoryModal = document.getElementById('victory-modal');
  const winnerNameDisplay = document.getElementById('winner-name-display');
  const playAgainBtn = document.getElementById('play-again-btn');

  // Question Modal Selectors
  const questionModal = document.getElementById('question-modal');
  const questionTypeTag = document.getElementById('question-type-tag');
  const questionText = document.getElementById('question-text');
  const optionsContainer = document.getElementById('options-container');
  const questionFeedback = document.getElementById('question-feedback');
  const feedbackMessage = document.getElementById('feedback-message');

  // --- SETUP FUNCTIONALITY ---
  
  // Handle player count selection
  playerSelector.addEventListener('click', (e) => {
    const target = e.target.closest('.selector-btn');
    if (!target) return;

    // Toggle active classes
    playerSelector.querySelectorAll('.selector-btn').forEach(btn => btn.classList.remove('active'));
    target.classList.add('active');

    // Get count and update inputs
    playerCount = parseInt(target.getAttribute('data-count'), 10);
    renderNameInputs(playerCount);
  });

  // Render input fields for player names
  function renderNameInputs(count) {
    namesInputsContainer.innerHTML = '';
    for (let i = 1; i <= count; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'input-wrapper';
      
      const decor = document.createElement('span');
      decor.className = `input-decor p${i}`;
      
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'player-name-input';
      input.id = `p${i}-name`;
      input.value = `Pemain ${i}`;
      input.placeholder = `Nama Pemain ${i}`;
      input.required = true;
      
      wrapper.appendChild(decor);
      wrapper.appendChild(input);
      namesInputsContainer.appendChild(wrapper);
    }
  }

  // --- GAME INITIALIZATION ---
  
  startGameBtn.addEventListener('click', () => {
    players = [];
    
    // Gather player names and validate
    for (let i = 1; i <= playerCount; i++) {
      const input = document.getElementById(`p${i}-name`);
      let name = input.value.trim();
      if (!name) {
        name = `Pemain ${i}`;
      }
      
      players.push({
        id: i,
        name: name,
        colorClass: `p${i}`,
        position: 1
      });
    }

    // Setup board and start
    generateBoard();
    currentPlayerIndex = 0;
    gameActive = true;
    
    // Switch screens
    setupScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    // Initial UI render
    updateTurnIndicator();
    updateTokens();
    updateStatusList();
    
    // Reset dice UI
    diceVisual.setAttribute('data-value', '1');
    diceResultText.textContent = 'Tekan tombol untuk melempar dadu';
    rollDiceBtn.disabled = false;

    // Draw SVG connections after rendering allows dimensions computation
    setTimeout(() => {
      drawSnakesAndLadders();
    }, 100);
  });

  // --- BOARD GENERATION ---
  
  function generateBoard() {
    boardGrid.innerHTML = '';
    
    // Generate array of numbers in standard grid rendering order (top-to-bottom)
    // Row 1 (Bottom): 1 to 10 (L-to-R)
    // Row 2: 20 to 11 (R-to-L)
    // Row 3: 21 to 30 (L-to-R)
    // Row 4: 40 to 31 (R-to-L)
    // Row 5 (Top): 41 to 50 (L-to-R)
    const boardNumbers = [];
    for (let r = 0; r < 5; r++) {
      const rowFromBottom = 4 - r; // 4, 3, 2, 1, 0
      const rowNumbers = [];
      for (let c = 0; c < 10; c++) {
        if (rowFromBottom % 2 === 0) {
          // Even rows from bottom: Left to Right
          rowNumbers.push(10 * rowFromBottom + c + 1);
        } else {
          // Odd rows from bottom: Right to Left
          rowNumbers.push(10 * rowFromBottom + (10 - c));
        }
      }
      boardNumbers.push(...rowNumbers);
    }

    // Render tiles based on numbers array
    boardNumbers.forEach(num => {
      const tile = document.createElement('div');
      
      // Determine the 10-tile color group
      const groupNum = Math.ceil(num / 10);
      tile.className = `tile tile-${num} group-${groupNum}`;
      
      // Label special tiles (Start, Finish, Ladder start, Snake head)
      let labelHtml = '';
      if (num === 1) {
        labelHtml = '<span class="tile-label">Mulai</span>';
      } else if (num === 50) {
        labelHtml = '<span class="tile-label">Selesai</span>';
      } else if (ladders[num]) {
        labelHtml = `<span class="tile-label" style="color: #10b981; font-weight: 800;">▲ ${ladders[num]}</span>`;
      } else if (snakes[num]) {
        labelHtml = `<span class="tile-label" style="color: #ef4444; font-weight: 800;">▼ ${snakes[num]}</span>`;
      }

      tile.innerHTML = `
        <span class="tile-number">${num}</span>
        ${labelHtml}
        <div class="tile-tokens" id="tile-tokens-${num}"></div>
      `;
      
      boardGrid.appendChild(tile);
    });
  }

  // --- TOKEN PLACEMENT ---
  
  function updateTokens() {
    // Clear all token spaces
    for (let i = 1; i <= 50; i++) {
      const container = document.getElementById(`tile-tokens-${i}`);
      if (container) {
        container.innerHTML = '';
      }
    }

    // Add each player's token to their current tile
    players.forEach(player => {
      const container = document.getElementById(`tile-tokens-${player.position}`);
      if (container) {
        const token = document.createElement('div');
        token.className = `token ${player.colorClass}`;
        token.title = player.name;
        token.textContent = `P${player.id}`;
        container.appendChild(token);
      }
    });
  }

  // --- TURN MANAGEMENT & GAME LOGIC ---
  
  function updateTurnIndicator() {
    const currentPlayer = players[currentPlayerIndex];
    
    // Update turn panel indicator color
    currentIndicator.className = 'active-indicator';
    currentIndicator.classList.add(currentPlayer.colorClass);
    
    // Update name
    currentPlayerDisplay.textContent = currentPlayer.name;
  }

  function updateStatusList() {
    playerStatusList.innerHTML = '';
    
    players.forEach((player, index) => {
      const item = document.createElement('div');
      item.className = 'player-status-item';
      if (index === currentPlayerIndex && gameActive) {
        item.classList.add('active');
      }

      item.innerHTML = `
        <div class="status-info">
          <span class="status-color-indicator ${player.colorClass}"></span>
          <span class="status-name">${player.name} (P${player.id})</span>
        </div>
        <div class="status-position">Kotak ${player.position}</div>
      `;
      
      playerStatusList.appendChild(item);
    });
  }

  // Handle Dice Rolling
  rollDiceBtn.addEventListener('click', () => {
    if (!gameActive || isRolling) return;
    
    isRolling = true;
    rollDiceBtn.disabled = true;
    
    const currentPlayer = players[currentPlayerIndex];
    let rollsCount = 0;
    const maxRolls = 6;
    let finalRoll = 1;

    // Simulate dice rolling micro-interaction
    const rollInterval = setInterval(() => {
      const tempRoll = Math.floor(Math.random() * 6) + 1;
      diceVisual.setAttribute('data-value', tempRoll.toString());
      rollsCount++;

      if (rollsCount >= maxRolls) {
        clearInterval(rollInterval);
        
        // Final roll result
        finalRoll = Math.floor(Math.random() * 6) + 1;
        diceVisual.setAttribute('data-value', finalRoll.toString());
        
        processTurn(currentPlayer, finalRoll);
      }
    }, 60);
  });

  function processTurn(player, roll) {
    const oldPosition = player.position;
    let newPosition = oldPosition + roll;
    let message = `${player.name} melempar dadu dan mendapatkan angka **${roll}**. `;

    // Bounce back logic if position exceeds 50
    if (newPosition > 50) {
      const overshoot = newPosition - 50;
      newPosition = 50 - overshoot;
      message += `Posisi melebihi 50! Mundur ${overshoot} langkah ke kotak **${newPosition}**.`;
    } else {
      message += `Maju dari kotak ${oldPosition} ke **${newPosition}**.`;
    }

    // Set temporary landed position
    player.position = newPosition;
    diceResultText.innerHTML = message;
    updateTokens();
    updateStatusList();

    // Check if landing position contains a ladder or snake
    const isLadder = ladders[newPosition] !== undefined;
    const isSnake = snakes[newPosition] !== undefined;

    if (isLadder || isSnake) {
      setTimeout(() => {
        askQuestion(player, newPosition, isLadder, (finalPosition, questionMsg) => {
          player.position = finalPosition;
          diceResultText.innerHTML += `<br>${questionMsg}`;
          updateTokens();
          updateStatusList();
          
          finishTurn(player);
        });
      }, 800);
    } else {
      finishTurn(player);
    }
  }

  function finishTurn(player) {
    // Check win condition
    if (player.position === 50) {
      setTimeout(() => {
        showWinner(player);
      }, 300);
    } else {
      // Move to next player
      currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
      updateTurnIndicator();
      updateStatusList();
      
      // Reset state for next roll
      isRolling = false;
      rollDiceBtn.disabled = false;
    }
  }

  // --- INTERACTIVE QUESTION SYSTEM ---

  function askQuestion(player, currentPos, isLadder, onComplete) {
    const qIndex = Math.floor(Math.random() * questionsBank.length);
    const questionObj = questionsBank[qIndex];

    // Configure Modal Header and Theme Tag
    if (isLadder) {
      questionTypeTag.textContent = "TANGGA!";
      questionTypeTag.className = "question-tag ladder-tag";
    } else {
      questionTypeTag.textContent = "ULAR!";
      questionTypeTag.className = "question-tag snake-tag";
    }

    // Populate question text
    questionText.textContent = questionObj.q;

    // Reset options and feedback
    optionsContainer.innerHTML = '';
    questionFeedback.className = 'question-feedback hidden';

    // Show modal overlay
    questionModal.classList.remove('hidden');

    // Create choice buttons
    questionObj.o.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';

      const prefix = document.createElement('span');
      prefix.className = 'option-prefix';
      prefix.textContent = String.fromCharCode(65 + index); // A, B, C, D

      const textSpan = document.createElement('span');
      textSpan.textContent = optText;

      btn.appendChild(prefix);
      btn.appendChild(textSpan);

      btn.addEventListener('click', () => {
        // Disable all buttons to prevent double-click
        const allButtons = optionsContainer.querySelectorAll('.option-btn');
        allButtons.forEach(b => b.disabled = true);

        const isCorrect = index === questionObj.a;

        if (isCorrect) {
          btn.classList.add('correct');
          showFeedback(true, isLadder);
        } else {
          btn.classList.add('wrong');
          allButtons[questionObj.a].classList.add('correct'); // Highlight correct answer
          showFeedback(false, isLadder);
        }

        // Determine final landing tile
        let finalPos = currentPos;
        let questionMsg = '';

        if (isLadder) {
          if (isCorrect) {
            finalPos = ladders[currentPos];
            questionMsg = `**Benar!** ${player.name} memanjat tangga ke kotak **${finalPos}**.`;
          } else {
            questionMsg = `**Salah!** ${player.name} tetap berada di kotak **${currentPos}**.`;
          }
        } else {
          if (isCorrect) {
            questionMsg = `**Benar!** ${player.name} menghindari ular dan tetap di kotak **${currentPos}**.`;
          } else {
            finalPos = snakes[currentPos];
            questionMsg = `**Salah!** ${player.name} digigit ular dan turun ke kotak **${finalPos}**.`;
          }
        }

        // Wait to show feedback before dismissing modal and completing movement
        setTimeout(() => {
          questionModal.classList.add('hidden');
          onComplete(finalPos, questionMsg);
        }, 2200);
      });

      optionsContainer.appendChild(btn);
    });
  }

  function showFeedback(isCorrect, isLadder) {
    questionFeedback.classList.remove('hidden');
    if (isCorrect) {
      questionFeedback.className = "question-feedback success";
      feedbackMessage.textContent = isLadder 
        ? "Jawaban Benar! Bersiaplah memanjat tangga! 🚀" 
        : "Jawaban Benar! Kamu selamat dari gigitan ular! 🛡️";
    } else {
      questionFeedback.className = "question-feedback error";
      feedbackMessage.textContent = isLadder 
        ? "Jawaban Salah! Kamu gagal memanjat tangga. ❌" 
        : "Jawaban Salah! Kamu digigit ular dan merosot turun... 🐍";
    }
  }

  // --- SVG CONNECTIONS DRAWING ---

  function getTileCenter(num) {
    const tile = document.querySelector(`.tile-${num}`);
    if (!tile) return null;
    
    // offsetLeft and offsetTop relative to board-grid (which matches SVG boundary)
    const x = tile.offsetLeft + tile.offsetWidth / 2;
    const y = tile.offsetTop + tile.offsetHeight / 2;
    return { x, y };
  }

  function drawSnakesAndLadders() {
    if (!gameActive) return;

    // Reset SVG content
    boardSvg.innerHTML = '';

    // Set SVG size dynamically based on current grid bounds
    boardSvg.setAttribute('width', boardGrid.offsetWidth);
    boardSvg.setAttribute('height', boardGrid.offsetHeight);

    // Render ladders
    for (const [startStr, endStr] of Object.entries(ladders)) {
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      
      const pStart = getTileCenter(start);
      const pEnd = getTileCenter(end);
      if (pStart && pEnd) {
        drawLadderSVG(pStart.x, pStart.y, pEnd.x, pEnd.y);
      }
    }

    // Render snakes
    for (const [startStr, endStr] of Object.entries(snakes)) {
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      
      const pStart = getTileCenter(start);
      const pEnd = getTileCenter(end);
      if (pStart && pEnd) {
        drawSnakeSVG(pStart.x, pStart.y, pEnd.x, pEnd.y);
      }
    }
  }

  function drawLadderSVG(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const px = -dy / distance;
    const py = dx / distance;
    
    const offset = 8; // Half ladder width
    
    // Side rail coordinates
    const rx1_start = x1 + px * offset;
    const ry1_start = y1 + py * offset;
    const rx1_end = x2 + px * offset;
    const ry1_end = y2 + py * offset;
    
    const rx2_start = x1 - px * offset;
    const ry2_start = y1 - py * offset;
    const rx2_end = x2 - px * offset;
    const ry2_end = y2 - py * offset;
    
    const railStyle = 'stroke: #10b981; stroke-width: 3.5; stroke-linecap: round; opacity: 0.85; filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.6));';
    
    // Left rail
    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', rx1_start);
    line1.setAttribute('y1', ry1_start);
    line1.setAttribute('x2', rx1_end);
    line1.setAttribute('y2', ry1_end);
    line1.setAttribute('style', railStyle);
    
    // Right rail
    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', rx2_start);
    line2.setAttribute('y1', ry2_start);
    line2.setAttribute('x2', rx2_end);
    line2.setAttribute('y2', ry2_end);
    line2.setAttribute('style', railStyle);
    
    boardSvg.appendChild(line1);
    boardSvg.appendChild(line2);
    
    // Rungs
    const rungsCount = Math.floor(distance / 20);
    const rungStyle = 'stroke: #eab308; stroke-width: 2; opacity: 0.9;';
    
    for (let i = 1; i < rungsCount; i++) {
      const t = i / rungsCount;
      const lx1 = rx1_start + t * (rx1_end - rx1_start);
      const ly1 = ry1_start + t * (ry1_end - ry1_start);
      const lx2 = rx2_start + t * (rx2_end - rx2_start);
      const ly2 = ry2_start + t * (ry2_end - ry2_start);
      
      const rung = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      rung.setAttribute('x1', lx1);
      rung.setAttribute('y1', ly1);
      rung.setAttribute('x2', lx2);
      rung.setAttribute('y2', ly2);
      rung.setAttribute('style', rungStyle);
      boardSvg.appendChild(rung);
    }
  }

  function drawSnakeSVG(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const px = -dy / distance;
    const py = dx / distance;
    
    // Wavy snake curve parameters
    const waveAmp = Math.min(25, distance * 0.15);
    const cp1x = x1 + dx * 0.33 + px * waveAmp;
    const cp1y = y1 + dy * 0.33 + py * waveAmp;
    const cp2x = x1 + dx * 0.66 - px * waveAmp;
    const cp2y = y1 + dy * 0.66 - py * waveAmp;
    
    const pathD = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
    
    // Draw wavy body
    const body = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    body.setAttribute('d', pathD);
    body.setAttribute('fill', 'none');
    body.setAttribute('stroke', '#ef4444');
    body.setAttribute('stroke-width', '5');
    body.setAttribute('stroke-linecap', 'round');
    body.setAttribute('style', 'opacity: 0.8; filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.6));');
    boardSvg.appendChild(body);
    
    // Draw head (at x1, y1)
    const head = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    head.setAttribute('cx', x1);
    head.setAttribute('cy', y1);
    head.setAttribute('r', '7');
    head.setAttribute('fill', '#ef4444');
    head.setAttribute('style', 'filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.8));');
    boardSvg.appendChild(head);
    
    // Draw tiny yellow eyes
    const eye1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    eye1.setAttribute('cx', x1 - 2);
    eye1.setAttribute('cy', y1 - 2);
    eye1.setAttribute('r', '1.5');
    eye1.setAttribute('fill', '#eab308');
    boardSvg.appendChild(eye1);

    const eye2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    eye2.setAttribute('cx', x1 + 2);
    eye2.setAttribute('cy', y1 - 2);
    eye2.setAttribute('r', '1.5');
    eye2.setAttribute('fill', '#eab308');
    boardSvg.appendChild(eye2);
  }

  // Handle board resizing on window resize
  window.addEventListener('resize', () => {
    drawSnakesAndLadders();
  });

  // --- VICTORY MANAGEMENT ---
  
  function showWinner(player) {
    gameActive = false;
    isRolling = false;
    
    winnerNameDisplay.textContent = player.name;
    winnerNameDisplay.className = `winner-name p${player.id}-text`;
    
    victoryModal.classList.remove('hidden');
  }

  // Reset/Play Again
  playAgainBtn.addEventListener('click', () => {
    // Hide modal and game screen
    victoryModal.classList.add('hidden');
    gameScreen.classList.add('hidden');
    
    // Clear SVG
    boardSvg.innerHTML = '';
    
    // Show setup screen
    setupScreen.classList.remove('hidden');
    
    // Reset state
    players = [];
    currentPlayerIndex = 0;
    isRolling = false;
    rollDiceBtn.disabled = false;
  });
});
