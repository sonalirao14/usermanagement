import 'reflect-metadata';
import container from './container';
import { AppBuilder } from './AppBuilder';
import { DependencyKeys } from './constant';
require('dotenv').config();

const port = 3000;

// Build and start the app
const appBuilder = container.get<AppBuilder>(DependencyKeys.AppBuilder);
appBuilder.build().start(port);