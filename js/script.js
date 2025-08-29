(function(){
  
  const playBtn = document.getElementById('play');
  const pauseBtn = document.getElementById('pause');
  const stopBtn = document.getElementById('stop');
  const nextBtn = document.getElementById('next');
  const prevBtn = document.getElementById('prev');
  const vinyl = document.getElementById('vinyl');
  const turntable = document.querySelector('.turntable');
  const audio = document.getElementById('audio');
  const volumeSlider = document.getElementById('volume');
  const volLabel = document.getElementById('vol-label');
  const coverImg = document.getElementById('cover-img');

  const controlButtons = [playBtn, pauseBtn, stopBtn];

  const playlistTable = document.getElementById('playlist-table');
  if (!playlistTable) {
    console.warn('playlist-table no encontrado en el DOM.');
    return;
  }
  const playlistRows = Array.from(playlistTable.querySelectorAll('tbody tr'));
  let currentTrackIndex = 0;
  let playCount = 0; 

  // PALETA DE DEGRADADOS
  const GRADIENTS = [
    'linear-gradient(90deg, rgba(255,154,158,0.95) 0%, rgba(250,208,196,0.9) 70%, rgba(255,255,255,0) 100%)',
    'linear-gradient(90deg, rgba(135,182,194,0.95) 0%, rgba(196,229,189,0.9) 70%, rgba(255,255,255,0) 100%)',
    'linear-gradient(90deg, rgba(181,126,220,0.95) 0%, rgba(243,200,255,0.9) 70%, rgba(255,255,255,0) 100%)',
    'linear-gradient(90deg, rgba(255,200,102,0.95) 0%, rgba(255,240,200,0.9) 70%, rgba(255,255,255,0) 100%)',
    'linear-gradient(90deg, rgba(120,220,255,0.95) 0%, rgba(180,240,200,0.9) 70%, rgba(255,255,255,0) 100%)'
  ];

  
  playlistRows.forEach(row => {
    row.style.transition = 'background-size 0.12s linear, color 0.12s linear';
    row.style.backgroundRepeat = 'no-repeat';
    row.style.backgroundPosition = 'left center';
    row.style.backgroundSize = '0% 100%';
    
    row.style.backgroundImage = '';
  });

  
  function setActiveButton(activeBtn) {
    controlButtons.forEach(btn => {
      if (!btn) return;
      btn.classList.toggle('active', btn === activeBtn);
    });
  }

  
  function applyGradientToRow(row) {
    const grad = GRADIENTS[playCount % GRADIENTS.length];
    row.style.backgroundImage = grad;
    row.style.backgroundSize = '0% 100%'; 
    row.style.color = ''; 
  }

  
  function markActiveRow(index) {
    playlistRows.forEach((r, i) => {
      if (i === index) {
        r.classList.add('playing-row');
      } else {
        r.classList.remove('playing-row');
        r.style.backgroundSize = '0% 100%';
        r.style.backgroundImage = ''; 
        r.style.color = '';
      }
    });
  }

  // reproducir pista por índice
  function playTrack(index) {
    if (!playlistRows.length) return;
    if (index < 0 || index >= playlistRows.length) return;
    currentTrackIndex = index;
    playCount++; 

    const row = playlistRows[index];
    const src = row.getAttribute('data-src');
    const cover = row.getAttribute('data-cover');

    if (!src) return;

    // cargar audio y portadas
    audio.src = src;
    if (coverImg && cover) coverImg.src = cover;
    const vinylCover = document.getElementById('vinyl-cover');
    if (vinylCover && cover) vinylCover.src = cover;

    // aplicar degradado y marcar fila
    applyGradientToRow(row);
    markActiveRow(index);

    // animaciones tornamesa
    vinyl.classList.add('playing');
    turntable.classList.add('playing');

    audio.play().then(() => {
      setActiveButton(playBtn);
    }).catch(err => {
      
      setActiveButton(playBtn);
      console.warn('No se pudo reproducir automáticamente:', err);
    });
  }

  // Click en filas para reproducir
  playlistRows.forEach((row, index) => {
    row.addEventListener('click', () => {
      playTrack(index);
    });
  });

  // degradado de la fila conforme avanza la canción
  audio.addEventListener('timeupdate', () => {
    if (!playlistRows[currentTrackIndex]) return;
    const dur = audio.duration;
    if (!dur || isNaN(dur) || dur === 0) return;
    const pct = (audio.currentTime / dur) * 100;
    const row = playlistRows[currentTrackIndex];
    row.style.backgroundSize = `${pct}% 100%`;
    
    row.style.color = pct > 45 ? '#fff' : '';
  });

  // avanzar o detener en la última
  audio.addEventListener('ended', () => {
    const row = playlistRows[currentTrackIndex];
    if (row) {
      row.style.backgroundSize = '100% 100%';
      row.style.color = '#fff';
    }
    if (currentTrackIndex < playlistRows.length - 1) {
      playTrack(currentTrackIndex + 1);
    } else {
      // ultima pista: limpiar visuales
      vinyl.classList.remove('playing');
      turntable.classList.remove('playing');
      setActiveButton(stopBtn);
    }
  });

  // CONTROLES: play/pause/stop/next/prev
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      
      if (!audio.src || audio.src === '') {
        playTrack(currentTrackIndex || 0);
        return;
      }
      vinyl.classList.add('playing');
      turntable.classList.add('playing');
      audio.play().catch(()=>{});
      setActiveButton(playBtn);
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      vinyl.classList.remove('playing');
      turntable.classList.remove('playing');
      audio.pause();
      setActiveButton(pauseBtn);
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      vinyl.classList.remove('playing');
      turntable.classList.remove('playing');
      audio.pause();
      audio.currentTime = 0;
      // reset visual
      const row = playlistRows[currentTrackIndex];
      if (row) {
        row.style.backgroundSize = '0% 100%';
        row.style.color = '';
      }
      setActiveButton(stopBtn);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentTrackIndex < playlistRows.length - 1) playTrack(currentTrackIndex + 1);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentTrackIndex > 0) playTrack(currentTrackIndex - 1);
    });
  }

  // VOLUMEN
  if (volumeSlider) {
    volumeSlider.addEventListener('input', () => {
      audio.volume = volumeSlider.value / 100;
      if (volLabel) volLabel.textContent = `${volumeSlider.value}%`;
    });
  }


  let initialIndex = -1;
  if (audio && audio.src) {
    initialIndex = playlistRows.findIndex(r => {
      const src = r.getAttribute('data-src') || '';
      if (!src) return false;
      try {
        const abs = new URL(src, location.href).href;
        return audio.src === abs || audio.src.endsWith(src) || abs.endsWith(audio.src) || audio.src.includes(src);
      } catch (e) {
        return audio.src.endsWith(src);
      }
    });
  }
  if (initialIndex === -1) initialIndex = 0;
  currentTrackIndex = initialIndex;

  // aplicar degradado inicial a la fila 
  applyGradientToRow(playlistRows[currentTrackIndex]);
  markActiveRow(currentTrackIndex);

  // si ya hay metadata cargada, actualizar progreso; si no, usar loadedmetadata
  function updateInitialProgress() {
    const row = playlistRows[currentTrackIndex];
    if (!row) return;
    if (!isNaN(audio.duration) && audio.duration > 0) {
      const pct = (audio.currentTime / audio.duration) * 100;
      row.style.backgroundSize = `${pct}% 100%`;
      row.style.color = pct > 45 ? '#fff' : '';
    }
  }
  updateInitialProgress();
  audio.addEventListener('loadedmetadata', updateInitialProgress);

})();
document.addEventListener("keydown", function (e) {
    
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
      (e.ctrlKey && e.key === "u")
    ) {
      e.preventDefault();
    }
  });

  
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });
