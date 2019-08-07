import { Amount, UnitKeywords } from './Amount';

export class DataAmountParseError extends Error { }

export enum DataUnit {
    BITS = 0,
    BYTES = 1,
    KILOBITS = 2,
    KILOBYTES = 3,
    MEGABITS = 4,
    MEGABYTES = 5,
    GIGABITS = 6,
    GIGABYTES = 7,
    TERABITS = 8,
    TERABYTES = 9,
}

export class DataAmount extends Amount<DataUnit, DataAmount> {
    static pattern = /([0-9]+)(\.[0-9]+)?([KMGkmg][bB]?|[bB])?/;

    static unitKeywords : UnitKeywords<DataUnit> = {
        'b': DataUnit.BITS,
        'B': DataUnit.BYTES,

        'kb': DataUnit.KILOBYTES,
        'kB': DataUnit.KILOBYTES,
        'KB': DataUnit.KILOBYTES,
        'Kb': DataUnit.KILOBITS,
        
        'mb': DataUnit.MEGABYTES,
        'mB': DataUnit.MEGABYTES,
        'MB': DataUnit.MEGABYTES,
        'Mb': DataUnit.MEGABITS,

        'gb': DataUnit.GIGABYTES,
        'gB': DataUnit.GIGABYTES,
        'GB': DataUnit.GIGABYTES,
        'Gb': DataUnit.GIGABITS,
  
        'tb': DataUnit.TERABYTES,
        'tB': DataUnit.TERABYTES,
        'TB': DataUnit.TERABYTES,
        'Tb': DataUnit.TERABITS,
    };

    static isValid ( value : string | number ) {
        return value && ( typeof value === 'number' || ( typeof value === 'string' && DataAmount.pattern.test( value ) ) );
    }

    static parse ( value : string | number | DataAmount ) : DataAmount {
        if ( !value ) {
            throw new DataAmountParseError( `Value is null.` )
        }

        if ( value instanceof DataAmount ) {
            return value;
        } else if ( typeof value === 'number' ) {
            return new DataAmount( value, DataUnit.BYTES );
        } else if ( typeof value === 'string' ) {
            const match = value.match( DataAmount.pattern );

            if ( match ) {
                const unit = DataAmount.unitKeywords[ match[ 3 ] ];

                if ( !unit ) {
                    throw new DataAmountParseError( `Data value string has invalid unit: ${ match[ 3 ] }.` );
                }

                return new DataAmount( parseFloat( match[ 1 ] + ( match[ 2 ] || '' ) ), unit );
            } else {
                throw new DataAmountParseError( `Data value string has invalid format.` );
            }
        } else {
            throw new DataAmountParseError( `Value should be a DataAmount, number or string.` );
        }
    }

    static tryParse ( value : string | number | DataAmount ) : DataAmount {
        try {
            return DataAmount.parse( value );
        } catch ( error ) {
            if ( error instanceof DataAmountParseError ) {
                return null;
            }

            throw error;
        }
    }

    protected exchangeRates = [ 
        { unit: DataUnit.BITS, multiplier : 1 },
        { unit: DataUnit.BYTES, multiplier : 8 },
        { unit: DataUnit.KILOBITS, multiplier : 125 },
        { unit: DataUnit.KILOBYTES, multiplier : 8 },
        { unit: DataUnit.MEGABITS, multiplier : 125 },
        { unit: DataUnit.MEGABYTES, multiplier : 8 },
        { unit: DataUnit.GIGABITS, multiplier : 125 },
        { unit: DataUnit.GIGABYTES, multiplier : 8 },
        { unit: DataUnit.TERABITS, multiplier : 125 },
        { unit: DataUnit.TERABYTES, multiplier : 8 },
    ];

    unitToString () {
        return DataUnit[ this.unit ];
    }
}
