async function transcribeAudio() {
  const fileInput = document.getElementById('audioFile');
  const outputText = document.getElementById('outputText');
  
  const file = fileInput.files[0];
  if (!file) {
    alert('Please select an audio file!');
    return;
  }

  outputText.value = 'Uploading and transcribing audio, please wait...';

  // 1. Upload the audio file to AssemblyAI
  const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
    method: 'POST',
    headers: {
      'authorization': 'a1b381ccd87f469b9ea60f78b02ece0c',
    },
    body: file
  });
  
  const uploadData = await uploadResponse.json();
  const audioUrl = uploadData.upload_url;

  // 2. Start transcription request
  const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      'authorization': 'a1b381ccd87f469b9ea60f78b02ece0c',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      speaker_labels: true
    })
  });

  const transcriptData = await transcriptResponse.json();
  const transcriptId = transcriptData.id;

  // 3. Polling for completion
  let completed = false;
  while (!completed) {
    const pollingResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      method: 'GET',
      headers: {
        'authorization': 'a1b381ccd87f469b9ea60f78b02ece0c',
      }
    });
    
    const pollingData = await pollingResponse.json();

    if (pollingData.status === 'completed') {
      completed = true;
      outputText.value = formatTranscription(pollingData.words);
    } else if (pollingData.status === 'failed') {
      outputText.value = 'Transcription failed. Please try again.';
      completed = true;
    } else {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds before next check
    }
  }
}

function formatTranscription(words) {
  if (!words || words.length === 0) {
    return "No words transcribed.";
  }

  let transcript = '';
  let currentSpeaker = words[0].speaker || 'Speaker';
  transcript += currentSpeaker + ': ';

  words.forEach((wordObj, idx) => {
    if (wordObj.speaker && wordObj.speaker !== currentSpeaker) {
      currentSpeaker = wordObj.speaker;
      transcript += '\n' + currentSpeaker + ': ';
    }
    transcript += wordObj.text + ' ';
  });

  return transcript.trim();
}

function downloadText() {
  const text = document.getElementById('outputText').value;
  const blob = new Blob([text], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'transcription.txt';
  link.click();
}

function generateQAReport() {
  const empathy = document.getElementById('qaEmpathy').value;
  const knowledge = document.getElementById('qaKnowledge').value;
  const resolution = document.getElementById('qaResolution').value;
  const report = `Quality Audit Report\n\nEmpathy: ${empathy}\nKnowledge: ${knowledge}\nResolution Handling: ${resolution}`;
  document.getElementById('qaReport').textContent = report;
}

function generateStats() {
  const text = document.getElementById('outputText').value;
  const words = text.trim().split(/\s+/).length;
  const speakerTurns = (text.match(/Agent:|Customer:|Speaker/g) || []).length;
  const avgWordsPerTurn = speakerTurns > 0 ? Math.round(words / speakerTurns) : 0;
  const approxDuration = Math.round(words / 150);
  const aht = approxDuration;
  let sentiment = 'Neutral';
  let agentAggressive = 'No';

  if (text.toLowerCase().includes('thank') || text.toLowerCase().includes('appreciate')) {
    sentiment = 'Positive';
  } else if (text.toLowerCase().includes('angry') || text.toLowerCase().includes('complain') || text.toLowerCase().includes('frustrated')) {
    sentiment = 'Negative';
  }

  if (text.toLowerCase().includes('shout') || text.toLowerCase().includes('rude') || text.toLowerCase().includes('angry') || text.toLowerCase().includes('frustrated')) {
    agentAggressive = 'Yes';
  }

  document.getElementById('statWords').textContent = words;
  document.getElementById('statTurns').textContent = speakerTurns;
  document.getElementById('statAvg').textContent = avgWordsPerTurn;
  document.getElementById('statDuration').textContent = approxDuration + ' min';
  document.getElementById('statSentiment').textContent = sentiment;
  document.getElementById('statAHT').textContent = aht + ' min';
  document.getElementById('statAggressive').textContent = agentAggressive;

  // Auto-fill QA fields
  if (text.toLowerCase().includes('thank') || text.toLowerCase().includes('sorry') || text.toLowerCase().includes('appreciate')) {
    document.getElementById('qaEmpathy').value = 'Excellent';
  } else {
    document.getElementById('qaEmpathy').value = 'Average';
  }

  if (text.toLowerCase().includes('solution') || text.toLowerCase().includes('help you') || text.toLowerCase().includes('assist')) {
    document.getElementById('qaKnowledge').value = 'Good';
  } else {
    document.getElementById('qaKnowledge').value = 'Average';
  }

  if (text.toLowerCase().includes('resolved') || text.toLowerCase().includes('fixed') || text.toLowerCase().includes('forwarded')) {
    document.getElementById('qaResolution').value = 'Resolved';
  } else if (text.toLowerCase().includes('escalate') || text.toLowerCase().includes('manager')) {
    document.getElementById('qaResolution').value = 'Escalated';
  } else {
    document.getElementById('qaResolution').value = 'Pending';
  }
}
