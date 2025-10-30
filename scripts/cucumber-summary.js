const fs = require('fs');
const path = require('path');

const REPORT_PATH = process.env.CUCUMBER_JSON || path.join('reports', 'cucumber.json');
const SUMMARY_PATH = process.env.GITHUB_STEP_SUMMARY;

const STATUS_ORDER = ['failed', 'ambiguous', 'undefined', 'pending', 'skipped', 'passed'];

function writeSummary(content) {
  if (!SUMMARY_PATH) {
    console.log('GITHUB_STEP_SUMMARY not set. Summary content:\n');
    console.log(content);
    return;
  }

  fs.appendFileSync(SUMMARY_PATH, content);
}

function loadReport(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { error: `Report file not found at ${filePath}` };
    }

    const raw = fs.readFileSync(filePath, 'utf-8').trim();
    if (!raw) {
      return { error: `Report file ${filePath} is empty.` };
    }

    return { data: JSON.parse(raw) };
  } catch (error) {
    return { error: `Failed to read cucumber report: ${error.message}` };
  }
}

function collectStepResults(scenario) {
  const steps = [];
  if (Array.isArray(scenario.steps)) {
    steps.push(...scenario.steps);
  }

  for (const hookKey of ['before', 'after']) {
    if (Array.isArray(scenario[hookKey])) {
      for (const hook of scenario[hookKey]) {
        if (hook && hook.result) {
          steps.push({
            keyword: `${hookKey} hook`,
            hidden: true,
            name: hook.match?.location || `${hookKey} hook`,
            result: hook.result
          });
        }
      }
    }
  }

  return steps;
}

function determineScenarioStatus(steps) {
  let scenarioStatus = 'passed';
  let sawUnknown = false;

  for (const step of steps) {
    const status = step?.result?.status;

    if (!status) {
      sawUnknown = true;
      continue;
    }

    if (status === 'failed' || status === 'ambiguous') {
      return status;
    }

    if (status === 'undefined' && STATUS_ORDER.indexOf('undefined') < STATUS_ORDER.indexOf(scenarioStatus)) {
      scenarioStatus = 'undefined';
    }

    if (status === 'pending' && scenarioStatus === 'passed') {
      scenarioStatus = 'pending';
    }

    if (status === 'skipped' && scenarioStatus === 'passed') {
      scenarioStatus = 'skipped';
    }
  }

  if (sawUnknown && scenarioStatus === 'passed') {
    return 'unknown';
  }

  return scenarioStatus;
}

function formatDuration(ns) {
  const duration = Number(ns) || 0;
  const seconds = duration / 1e9;

  if (seconds >= 120) {
    return `${(seconds / 60).toFixed(1)}m`;
  }

  if (seconds >= 10) {
    return `${seconds.toFixed(1)}s`;
  }

  return `${seconds.toFixed(2)}s`;
}

function buildSummary(report) {
  const summary = {
    totalFeatures: 0,
    totalScenarios: 0,
    scenarioCounts: {
      passed: 0,
      failed: 0,
      ambiguous: 0,
      skipped: 0,
      pending: 0,
      undefined: 0,
      unknown: 0
    },
    totalDurationNs: 0,
    failedScenarios: []
  };

  const featureArray = Array.isArray(report) ? report : [];
  summary.totalFeatures = featureArray.length;

  for (const feature of featureArray) {
    const scenarios = Array.isArray(feature.elements) ? feature.elements : [];

    for (const scenario of scenarios) {
      if (scenario.type !== 'scenario' && scenario.type !== 'scenario_outline') {
        continue;
      }

      summary.totalScenarios += 1;

      const steps = collectStepResults(scenario);
      const status = determineScenarioStatus(steps);
      const scenarioDurationNs = steps.reduce(
        (acc, step) => acc + (Number(step?.result?.duration) || 0),
        0
      );
      summary.totalDurationNs += scenarioDurationNs;

      if (!summary.scenarioCounts[status]) {
        summary.scenarioCounts[status] = 0;
      }
      summary.scenarioCounts[status] += 1;

      if (status === 'failed' || status === 'ambiguous') {
        const failingStatuses = status === 'failed' ? ['failed'] : ['ambiguous', 'failed'];
        const failedStep = steps.find((step) => failingStatuses.includes(step?.result?.status));
        summary.failedScenarios.push({
          name: scenario.name || 'Unnamed Scenario',
          feature: feature.name || 'Unnamed Feature',
          durationNs: scenarioDurationNs,
          error: failedStep?.result?.error_message?.split('\n')[0] || 'Unknown error',
          tags: Array.isArray(scenario.tags) ? scenario.tags.map((tag) => tag.name).join(' ') : '',
          status
        });
      }
    }
  }

  return summary;
}

function renderMarkdown(summary) {
  const totalPassed = summary.scenarioCounts.passed || 0;
  const totalFailed = summary.scenarioCounts.failed || 0;
  const totalAmbiguous = summary.scenarioCounts.ambiguous || 0;
  const totalSkipped = summary.scenarioCounts.skipped || 0;
  const totalPending = summary.scenarioCounts.pending || 0;
  const totalUndefined = summary.scenarioCounts.undefined || 0;
  const totalUnknown = summary.scenarioCounts.unknown || 0;

  let content = '### Cucumber Test Summary\n\n';
  content += `Generated at ${new Date().toISOString()}\n\n`;
  content += '| Metric | Count |\n';
  content += '| --- | ---: |\n';
  content += `| Features | ${summary.totalFeatures} |\n`;
  content += `| Scenarios | ${summary.totalScenarios} |\n`;
  content += `| Passed | ${totalPassed} |\n`;
  content += `| Failed | ${totalFailed} |\n`;
  content += `| Pending | ${totalPending} |\n`;
  content += `| Skipped | ${totalSkipped} |\n`;
  if (totalAmbiguous > 0) {
    content += `| Ambiguous | ${totalAmbiguous} |\n`;
  }
  if (totalUndefined > 0) {
    content += `| Undefined | ${totalUndefined} |\n`;
  }
  if (totalUnknown > 0) {
    content += `| Unknown | ${totalUnknown} |\n`;
  }
  content += `| Duration | ${formatDuration(summary.totalDurationNs)} |\n\n`;

  if (summary.failedScenarios.length > 0) {
    content += '#### Failed or Ambiguous Scenarios\n';

    summary.failedScenarios.slice(0, 10).forEach((failure) => {
      content += `- **${failure.feature} › ${failure.name}** (${failure.status}, ${formatDuration(failure.durationNs)})\n`;
      if (failure.tags) {
        content += `  - Tags: ${failure.tags}\n`;
      }
      content += `  - ${failure.error}\n`;
    });

    if (summary.failedScenarios.length > 10) {
      content += `- ...and ${summary.failedScenarios.length - 10} more\n`;
    }

    content += '\n';
  }

  return content.trimEnd() + '\n';
}

function main() {
  const { data, error } = loadReport(REPORT_PATH);

  if (error) {
    writeSummary(`### Cucumber Test Summary\n\n${error}\n`);
    process.exitCode = 0;
    return;
  }

  const summary = buildSummary(data);
  const markdown = renderMarkdown(summary);
  writeSummary(markdown);
}

main();
