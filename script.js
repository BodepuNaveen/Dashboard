function transcribeAudio() {
  alert('Transcription process started... (Placeholder)');
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
  const speakerTurns = (text.match(/Agent:|Customer:/g) || []).length;
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

  // Auto-fill QA
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