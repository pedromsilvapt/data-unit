# Unit

> Simple TypeScript/ES2017 classes to represent unit values (like time/data size)

# Installation
```shell
npm install --save data-unit
```

# Usage
Using data size units:
```typescript
import { DataAmount, DataUnit } from './Data';

const data = new DataAmount( 100, DataUnit.MEGABITS );

// Easily print both the value and the unit
data.toString();
data.toHumanString();

// Converting and Retrieving the value
data.convert( DataUnit.MEGABYTES ); // returns a data amount object
data.as( DataUnit.MEGABYTES ); // returns a number
data.value; data.unit; // Get the current value and unit

// Math Operations allowed
data.plus( 10 ); // When a number is provided, the same unit is used
data.minus( '10GB' ); // A string allows to specify custom units
data.mul( data ); // Can mul two objects as well
data.div( data );

// All math operations
data.plus( 10 );
data.minus( 10 );
data.mul( 10 );
data.div( 10 );

// Comparison operations
data.atMost( '10Mb' ); // clamps the value to a max of 10Mb
data.atLeast( '1GB' ); // clamps the value to a min of 1GB
data.clamp( '10Mb', '1GB' ) // clamps the value anywhere between 10Mb and 1GB

// Also some auxiliary methods to handle decimal places
data.ceil(); data.floor(); data.round(); data.round( 2 );
```

Using duration units:
```typescript

import { Duration, DurationUnit } from './Duration';

const duration = new Duration( 10, DurationUnit.DAYS );
const duration = Duration.parse( '10s' ); // 10 seconds
const duration = Duration.parse( '01:31' ); // 1 minute and 31 seconds
const duration = Duration.parse( '01:31:22.500' ); // 1 hour, 31 minutes, 22 seconds and 500 milliseconds

// We can then use the same methods as in data amount objects
```
