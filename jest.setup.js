// jest.setup.js
import '@testing-library/jest-dom'

global.TextDecoder = require('util').TextDecoder;
global.TextEncoder = require('util').TextEncoder;