# cwa-api-perfomance-tests

## 🐳 Running with Docker

### ✅ Prerequisites:
- Docker installed

### 🔧 Steps:

1. **Build the Docker image:**

```bash
docker build -t k6-perf-test .
```

2. **Run the performance test using Docker:**

```bash
docker run --rm k6-perf-test
```

3. **View the summary report:**

After the test, a `summary.json` will be generated inside the container. To persist and view it locally, mount a volume:

```bash
docker run --rm -v $(pwd):/results k6-perf-test cp /app/summary.json /results/
```

---

## 🖥️ Running without Docker

### ✅ Prerequisites:
- Node.js v20+
- k6 CLI installed (https://k6.io/docs/getting-started/installation/)
- `test_data/` folder and test scripts available in your local directory

### 🔧 Steps:

1**Run the preprocessing script:**

```bash
node generateFileList.js
```

This will generate a `fileList.json` that is used by the k6 test.

2**Run the k6 performance script:**

```bash
k6 run csv_performance_script.js
```

3**View the summary:**

k6 will output results in the console. You can also export a summary:

```bash
k6 run --summary-export=summary.json csv_performance_script.js
```

---

## 📁 Project Structure

```
.
├── Dockerfile
├── generateFileList.js
├── csv_performance_script.js
├── fileList.json (generated)
├── test_data/
│   └── ...your CSV files...
```