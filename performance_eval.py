import requests
import time
from concurrent.futures import ThreadPoolExecutor


def fetch_url(url):
    """Send a GET request to the specified URL and measure response time."""
    try:
        start_time = time.time()
        response = requests.get(url)
        end_time = time.time()
        latency = end_time - start_time
        return {
            "status_code": response.status_code,
            "latency": latency,
            "success": response.ok
        }
    except Exception as e:
        return {"error": str(e)}


def load_test(url, num_requests, concurrency=10):
    """Run a load test by sending simultaneous requests."""
    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        results = list(executor.map(fetch_url, [url] * num_requests))
    return results


def calculate_metrics(results):
    """Calculate response time, throughput, and error rates from results."""
    total_requests = len(results)
    successful_requests = sum(1 for r in results if r.get("success"))
    failed_requests = total_requests - successful_requests
    total_time = sum(r["latency"] for r in results if "latency" in r)

    # Metrics
    average_response_time = total_time / successful_requests if successful_requests else 0
    throughput = successful_requests / total_time if total_time > 0 else 0
    error_rate = failed_requests / total_requests if total_requests > 0 else 0

    return {
        "Total Requests": total_requests,
        "Successful Requests": successful_requests,
        "Failed Requests": failed_requests,
        "Average Response Time (s)": round(average_response_time, 2),
        "Throughput (requests/sec)": round(throughput, 2),
        "Error Rate (%)": round(error_rate * 100, 2)
    }


# Test URL, worked correctly
# url = "https://httpbin.org/get"

# URL for our website
url = "http://msml-data-650-front-end-static-cb-dr-mn.s3-website-us-east-1.amazonaws.com/"
num_requests = 200
concurrency = 10

print(f"Running load test for {num_requests} requests with concurrency {concurrency}...")
results = load_test(url, num_requests, concurrency)

metrics = calculate_metrics(results)
for key, value in metrics.items():
    print(f"{key}: {value}")
