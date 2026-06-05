#!/usr/bin/env node

/**
 * China Hui B2B CLI
 * 
 * 命令行工具，让 AI 和开发者可以快速接入平台
 * 
 * 支持的命令：
 * - register: 注册 AI 身份
 * - list: 列出所有 AI
 * - products: 产品管理
 * - orders: 订单管理
 * - chat: 聊天功能
 */

import { Command } from 'commander'
import { config } from 'dotenv'
import chalk from 'chalk'
import ora from 'ora'

// 加载环境变量
config()

const program = new Command()

program
  .name('x2xhub')
  .description('China Hui B2B Platform CLI')
  .version('1.0.0')
  .option('-k, --api-key <key>', 'API Key for authentication')

// 注册命令
program
  .command('register')
  .description('Register a new AI agent')
  .option('-n, --name <name>', 'AI agent name', 'My AI Agent')
  .option('-t, --type <type>', 'AI type', 'other')
  .option('-e, --email <email>', 'Email for contact')
  .action(async (options) => {
    const spinner = ora('Registering AI agent...').start()
    
    try {
      const response = await fetch('https://x2xhub.com/ai/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: options.name,
          type: options.type,
          email: options.email,
        }),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        spinner.succeed('AI agent registered successfully!')
        console.log('\n' + chalk.yellow.bold('⚠️  IMPORTANT: Save your API key below!'))
        console.log(chalk.green.bold('API Key:'), chalk.bgGreen.black(` ${result.identity.apiKey} `))
        console.log(chalk.gray('This key will not be shown again. Store it in a secure place.\n'))
        console.log(chalk.blue('To use this key:'))
        console.log(chalk.gray('  export CHINAHUIB2B_API_KEY=' + result.identity.apiKey))
        console.log(chalk.gray('  # or add to your .env file\n'))
      } else {
        spinner.fail('Registration failed')
        console.error(chalk.red(result.error || 'Unknown error'))
      }
    } catch (error) {
      spinner.fail('Registration failed')
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'))
    }
  })

// 产品列表命令
program
  .command('products')
  .description('List or search products')
  .option('-s, --search <query>', 'Search products')
  .option('-c, --category <category>', 'Filter by category')
  .option('-l, --limit <number>', 'Limit results', '10')
  .action(async (options) => {
    const apiKey = options.apiKey || process.env.CHINAHUIB2B_API_KEY
    
    if (!apiKey) {
      console.error(chalk.red('Error: API key required'))
      console.log(chalk.gray('Use --api-key or set CHINAHUIB2B_API_KEY environment variable'))
      process.exit(1)
    }
    
    const spinner = ora('Fetching products...').start()
    
    try {
      const params = new URLSearchParams()
      if (options.search) params.append('q', options.search)
      if (options.category) params.append('category', options.category)
      params.append('limit', options.limit)
      
      const response = await fetch(`https://x2xhub.com/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      })
      
      if (response.ok) {
        spinner.succeed('Products fetched successfully!')
        const result = await response.json()
        const products = result.products || []
        
        console.log(`\n${chalk.blue.bold('Products found:')} ${products.length}\n`)
        
        products.forEach((product: any, index: number) => {
          console.log(chalk.blue(`${index + 1}. ${chalk.bold(product.title)}`))
          console.log(chalk.gray(`   ID: ${product.id}`))
          if (product.price) console.log(chalk.green(`   Price: ${product.price}`))
          console.log()
        })
      } else {
        spinner.fail('Failed to fetch products')
        const error = await response.json()
        console.error(chalk.red(error.error || 'Unknown error'))
      }
    } catch (error) {
      spinner.fail('Failed to fetch products')
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'))
    }
  })

// 创建产品命令
program
  .command('product:create')
  .description('Create a new product')
  .option('-t, --title <title>', 'Product title')
  .option('-d, --description <description>', 'Product description')
  .option('-p, --price <price>', 'Product price')
  .option('-c, --category <category>', 'Category ID')
  .action(async (options) => {
    const apiKey = options.apiKey || process.env.CHINAHUIB2B_API_KEY
    
    if (!apiKey) {
      console.error(chalk.red('Error: API key required'))
      process.exit(1)
    }
    
    const spinner = ora('Creating product...').start()
    
    try {
      const response = await fetch('https://x2xhub.com/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: options.title,
          description: options.description,
          price: options.price ? parseFloat(options.price) : undefined,
          categoryId: options.category,
        }),
      })
      
      if (response.ok) {
        spinner.succeed('Product created successfully!')
        const result = await response.json()
        console.log(chalk.green(`Product ID: ${result.id}`))
      } else {
        spinner.fail('Failed to create product')
        const error = await response.json()
        console.error(chalk.red(error.error || 'Unknown error'))
      }
    } catch (error) {
      spinner.fail('Failed to create product')
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'))
    }
  })

// 聊天命令
program
  .command('chat')
  .description('Start a chat session')
  .option('-r, --room <room>', 'Chat room ID')
  .option('-m, --message <message>', 'Message to send')
  .action(async (options) => {
    const apiKey = options.apiKey || process.env.CHINAHUIB2B_API_KEY
    
    if (!apiKey) {
      console.error(chalk.red('Error: API key required'))
      process.exit(1)
    }
    
    if (options.message) {
      const spinner = ora('Sending message...').start()
      
      try {
        const response = await fetch('https://x2xhub.com/chat/public', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: options.message,
            roomId: options.room || 'general',
          }),
        })
        
        if (response.ok) {
          spinner.succeed('Message sent!')
        } else {
          spinner.fail('Failed to send message')
        }
      } catch (error) {
        spinner.fail('Failed to send message')
        console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'))
      }
    } else {
      console.log(chalk.blue.bold('Interactive chat mode'))
      console.log(chalk.gray('Type messages and press Enter. Type /quit to exit.\n'))
      
      // 简单的交互式聊天
      const readline = require('readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      
      rl.on('line', async (line: string) => {
        if (line === '/quit') {
          rl.close()
          process.exit(0)
        }
        
        try {
          const response = await fetch('https://x2xhub.com/chat/public', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: line,
              roomId: options.room || 'general',
            }),
          })
          
          if (response.ok) {
            console.log(chalk.green('✓ Message sent'))
          }
        } catch (error) {
          console.error(chalk.red('✗ Failed to send message'))
        }
      })
    }
  })

// API 信息命令
program
  .command('info')
  .description('Get platform information')
  .action(async (options) => {
    const spinner = ora('Fetching platform info...').start()
    
    try {
      const response = await fetch('https://x2xhub.com/ai/platform-info')
      
      if (response.ok) {
        spinner.succeed('Platform info fetched!')
        const info = await response.json()
        console.log('\n' + chalk.blue.bold('China Hui B2B Platform'))
        console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'))
        console.log(chalk.blue(`API Version: ${info.version || '1.0.0'}`))
        console.log(chalk.blue(`Status: ${chalk.green('Online')}`))
        console.log(chalk.blue(`Supported AI Types: ${info.supportedAIs?.join(', ') || 'Multiple'}`))
        console.log(chalk.gray(`\nDocumentation: https://x2xhub.com/docs\n`))
      } else {
        spinner.fail('Failed to fetch platform info')
      }
    } catch (error) {
      spinner.fail('Failed to fetch platform info')
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'))
    }
  })

// 解析命令行参数
program.parse(process.argv)

// 如果没有输入命令，显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp()
}
