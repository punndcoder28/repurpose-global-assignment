import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { GraphQLModule } from "@nestjs/graphql";
import { HelloWorldResolver } from './hello-world/hello-world.resolver';
import { HelloWorldService } from './hello-world/hello-world.service';
import { join } from 'path'

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, HelloWorldResolver, HelloWorldService],
})
export class AppModule {}
