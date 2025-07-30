#!/usr/bin/env node

/**
 * 检查环境变量配置状态
 */

const fs = require('fs');
const path = require('path');

function checkEnvSource() {
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  // 检测环境类型
  const isCI = process.env.CI === 'true';
  const isVercel = process.env.VERCEL === '1';
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log('🔍 环境变量配置检查...\n');
  
  if (isCI || isVercel || isProduction) {
    console.log('🚀 部署环境检测');
    console.log(`   CI: ${isCI}`);
    console.log(`   Vercel: ${isVercel}`);
    console.log(`   Production: ${isProduction}`);
    
    // 检查关键环境变量
    const requiredVars = ['OPENAI_API_KEY', 'OPENAI_BASE_URL', 'OPENAI_MODEL'];
    let allPresent = true;
    
    requiredVars.forEach(key => {
      if (process.env[key]) {
        console.log(`✅ ${key}: 已配置`);
      } else {
        console.log(`❌ ${key}: 未配置`);
        allPresent = false;
      }
    });
    
    if (allPresent) {
      console.log('\n✅ 部署环境配置正常');
    } else {
      console.log('\n❌ 部署环境缺少必要的环境变量');
      process.exit(1);
    }
    return;
  }
  
  // 本地开发环境检查
  console.log('🏠 本地开发环境检测');
  
  if (!fs.existsSync(envLocalPath)) {
    console.log('⚠️  .env.local 文件不存在，将使用系统环境变量');
    return;
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

  console.log('\n📋 项目环境变量状态:');

  let hasSystemEnv = false;
  
  Object.keys(envVars).forEach(key => {
    const projectValue = envVars[key];
    const processValue = process.env[key];
    
    if (processValue && processValue !== projectValue) {
      console.log(`⚠️  ${key}: 系统环境变量覆盖了项目配置`);
      hasSystemEnv = true;
    } else if (processValue === projectValue) {
      console.log(`✅ ${key}: 使用项目配置`);
    } else {
      console.log(`📝 ${key}: 仅在项目文件中定义`);
    }
  });

  if (hasSystemEnv) {
    console.log('\n💡 建议使用 npm run dev 来确保环境隔离');
  } else {
    console.log('\n✅ 环境变量配置正常');
  }
}

checkEnvSource();