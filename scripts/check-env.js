#!/usr/bin/env node

/**
 * 检查环境变量是否只从项目的.env.local文件加载
 */

const fs = require('fs');
const path = require('path');

function checkEnvSource() {
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envLocalPath)) {
    console.error('❌ .env.local 文件不存在');
    process.exit(1);
  }

  // 读取.env.local文件
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    }
  });

  console.log('🔍 检查环境变量来源...\n');

  let hasSystemEnv = false;
  
  Object.keys(envVars).forEach(key => {
    const projectValue = envVars[key];
    const processValue = process.env[key];
    
    if (processValue && processValue !== projectValue) {
      console.log(`⚠️  ${key}: 系统环境变量覆盖了项目配置`);
      console.log(`   项目值: ${projectValue}`);
      console.log(`   系统值: ${processValue}`);
      hasSystemEnv = true;
    } else if (processValue === projectValue) {
      console.log(`✅ ${key}: 使用项目配置`);
    }
  });

  if (hasSystemEnv) {
    console.log('\n❌ 检测到系统环境变量干扰，建议使用隔离的启动方式');
    process.exit(1);
  } else {
    console.log('\n✅ 所有环境变量都来自项目配置');
  }
}

checkEnvSource();