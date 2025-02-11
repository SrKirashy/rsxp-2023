import { Controller, Post, Req, Res, Get, UseGuards } from '@nestjs/common'
import { RequireAuthProp, sessions, users } from '@clerk/clerk-sdk-node'
import { Request, Response } from 'express'

import { PrismaService } from './database/prisma.service'
import { ClerkGuard } from './clerk/clerk.guard'

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getUsers() {
    const users = await this.prisma.user.findMany()

    return {
      data: users,
    }
  }

  @Post()
  async verifySession(@Req() request: Request, @Res() response: Response) {
    const sessionId = request.body.sessionId
    const token = request.body.token

    if (typeof sessionId === 'string') {
      const session = await sessions.verifySession(sessionId, token)

      if (!session) {
        return response.status(400).json({
          error: 'Session not verified',
        })
      }

      const user = await users.getUser(session.userId)

      console.log(user)

      return response.json({
        message: 'Session verified',
      })
    }

    return response.status(400).json({
      error: 'Session not verified',
    })
  }

  @Get('/auth')
  @UseGuards(ClerkGuard)
  async get(@Req() req: RequireAuthProp<Request>) {
    return {
      data: req.auth,
    }
  }
}
