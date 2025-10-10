#!/usr/bin/env -S deno run --allow-net --allow-env

/**
 * Deployment Status Checker
 * Checks if the deployed application is running correctly
 */

const DEPLOY_URL = "https://portfolio.leondev.me";
const API_ENDPOINTS = ["/", "/api/data", "/api/profile"];

interface HealthCheck {
  url: string;
  status: number;
  responseTime: number;
  success: boolean;
  error?: string;
}

async function checkEndpoint(endpoint: string): Promise<HealthCheck> {
  const url = `${DEPLOY_URL}${endpoint}`;
  const startTime = Date.now();

  try {
    const response = await fetch(url);
    const responseTime = Date.now() - startTime;

    return {
      url,
      status: response.status,
      responseTime,
      success: response.ok,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      url,
      status: 0,
      responseTime,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  console.log("🏥 Health Check for Portfolio Deployment");
  console.log("=".repeat(50));
  console.log(`📍 Base URL: ${DEPLOY_URL}`);
  console.log("");

  const results: HealthCheck[] = [];

  for (const endpoint of API_ENDPOINTS) {
    console.log(`🔍 Checking: ${endpoint}`);
    const result = await checkEndpoint(endpoint);
    results.push(result);

    if (result.success) {
      console.log(`✅ ${result.status} - ${result.responseTime}ms`);
    } else {
      console.log(`❌ ${result.status} - ${result.error || "Request failed"}`);
    }
  }

  console.log("");
  console.log("📊 Summary:");
  console.log("-".repeat(30));

  const successful = results.filter((r) => r.success).length;
  const total = results.length;
  const avgResponseTime = results.filter((r) => r.success).reduce((sum, r) => sum + r.responseTime, 0) / successful || 0;

  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`⚡ Avg Response Time: ${avgResponseTime.toFixed(0)}ms`);

  if (successful === total) {
    console.log("🎉 All endpoints are healthy!");
  } else {
    console.log("⚠️  Some endpoints are failing!");
  }
}

if (import.meta.main) {
  await main();
}
