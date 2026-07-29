import { Controller, Post, Body, BadRequestException, Logger } from '@nestjs/common';
import { HubsoftService } from './hubsoft.service';

@Controller('integrations')
export class IntegrationsController {
    private readonly logger = new Logger(IntegrationsController.name);
    constructor(private readonly hubsoftService: HubsoftService) {}

    @Post('ticket')
    async createTicket(@Body() body: any) {
        try{
            this.logger.log('Received request to create a ticket', body);
            const response = await this.hubsoftService.createTicket(body);
            this.logger.log('Ticket created successfully', response);
            return response;
        } catch (error : unknown) {
            this.logger.error('Error creating ticket', error);
            throw new BadRequestException(error as unknown as string);
        }
    }
}