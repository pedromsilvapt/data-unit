import { Amount, UnitKeywords } from './Amount';

export class DurationParseError extends Error { }

export enum DurationUnit {
    MILLISECONDS,
    SECONDS,
    MINUTES,
    HOURS,
    DAYS,
    WEEKS
}

export class Duration extends Amount<DurationUnit, Duration> {
    public static unitPattern = /(\d+)\s*(w|d|h|m|s|ms)/i;

    public static aggregatePattern = /(\d+)(:\d+){0,4}(\.\d+)?/;

    static unitKeywords : UnitKeywords<DurationUnit> = {
        'ms': DurationUnit.MILLISECONDS,
        's': DurationUnit.SECONDS,
        'm': DurationUnit.MINUTES,
        'h': DurationUnit.HOURS,
        'd': DurationUnit.DAYS,
        'w': DurationUnit.WEEKS
    };

    protected exchangeRates: { unit: DurationUnit; multiplier: number; }[] = [
        { unit: DurationUnit.MILLISECONDS, multiplier : 1 },
        { unit: DurationUnit.SECONDS, multiplier : 1000 },
        { unit: DurationUnit.MINUTES, multiplier : 60 },
        { unit: DurationUnit.HOURS, multiplier : 60 },
        { unit: DurationUnit.DAYS, multiplier : 24 },
        { unit: DurationUnit.WEEKS, multiplier : 7 },
    ];

    static isValid ( value : string | number ) {
        const validString = ( typeof value === 'string' && ( Duration.unitPattern.test( value ) || Duration.aggregatePattern.test( value ) ) );

        return value && ( typeof value === 'number' || validString );
    }

    static parse ( value : string | number | Duration ) : Duration {
        if ( value === void 0 || value === null ) {
            throw new DurationParseError( `Value is null.` )
        }

        if ( value instanceof Duration ) {
            return value;
        } else if ( typeof value === 'number' ) {
            return new Duration( value, DurationUnit.SECONDS );
        } else if ( typeof value === 'string' ) {
            let match = value.match( Duration.unitPattern );

            if ( match ) {
                const value = +match[ 1 ];

                const unit = Duration.unitKeywords[ match[ 2 ].toLowerCase() ] as DurationUnit;

                return new Duration( value, unit );
            } else {
                match = value.match( Duration.aggregatePattern );

                if ( !match ) {
                    throw new DurationParseError( `Duration value string has invalid format.` );
                }

                const segments = value.split( ':' );

                let base = 1;

                // If the last element (seconds) contains a period, then anything after the period should be treated as milliseconds
                if ( segments[ segments.length - 1 ].indexOf( '.' ) >= 0 ) {
                    // Remove the last element (that stores seconds, segments.length - 1), and append two items
                    segments.splice( segments.length - 1, 1, ...segments[ segments.length - 1 ].split( '.' ) );

                    base = 0;
                }

                const exchangeRates = ( new Duration( 0, DurationUnit.SECONDS ) ).exchangeRates;

                const units = segments.map( ( value, index ) => {
                    const unitIndex = base + ( segments.length - index - 1 );

                    const unit = exchangeRates[ unitIndex ].unit;

                    return new Duration( +value, unit );
                } );

                return units.reduce( ( a, b ) => a.plus( b ), new Duration( 0, DurationUnit.SECONDS ) );
            }
        } else {
            throw new DurationParseError( `Value should be a Duration, number or string.` );
        }
    }

    static tryParse ( value : string | number | Duration ) : Duration {
        try {
            return Duration.parse( value );
        } catch ( error ) {
            if ( error instanceof DurationParseError ) {
                return null;
            }

            throw error;
        }
    }

    // Override
    unitToString () {
        const keys = Object.keys( Duration.unitKeywords );

        return keys.find( key => Duration.unitKeywords[ key ] === this.unit );
    }

    toHumanShortString () {
        const minutes = Math.floor( this.as( DurationUnit.MINUTES ) );

        const seconds = Math.floor( this.as( DurationUnit.SECONDS ) % 60 );

        return `${ minutes }:${ seconds }`;
    }

    // Override
    toHumanString ( showMilliseconds : boolean = true ) {
        const hours = Math.floor( this.as( DurationUnit.HOURS ) );

        const minutes = Math.floor( this.as( DurationUnit.MINUTES ) );

        const seconds = Math.floor( this.as( DurationUnit.SECONDS ) % 60 );

        const milliseconds = this.as( DurationUnit.MILLISECONDS ) % 1000;

        const hoursStr = String( hours ).padStart( 2, '0' );

        const minutesStr = String( minutes ).padStart( 2, '0' );

        const secondsStr = String( seconds ).padStart( 2, '0' );

        const millisecondsStr = String( milliseconds ).padStart( 3, '0' );

        let string = `${ hoursStr }:${ minutesStr }:${ secondsStr }`;

        if ( showMilliseconds ) {
            string += `.${ millisecondsStr }`;
        }

        return string;
    }
}