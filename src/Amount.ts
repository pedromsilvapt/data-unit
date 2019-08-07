export interface UnitKeywords<T> {
    [ key : string ] : T;
}

export abstract class Amount<U extends number, A extends Amount<U, A>> {
    readonly value : number;
    readonly unit : U;
    

    get previousUnit () : U {
        return ( this.unit - 1 ) as U;
    }

    get nextUnit () : U {
        return ( this.unit + 1 ) as U;
    }

    protected abstract exchangeRates : { unit: U, multiplier : number }[];

    constructor ( value : number, unit : U ) {
        this.value = value;
        this.unit = unit;
    }

    protected create ( value : number, unit : U ) : A {
        return new ( this.constructor as any )( value, unit );
    }
    
    protected unaryOp ( op : ( a : number ) => number ) {
        return this.create( op( this.value ), this.unit );
    }
    
    protected binaryOp ( value : number | string | A, op : ( a : number, b : number ) => number ) {
        if ( typeof value === 'number' ) {
            return this.create( op( this.value, value ), this.unit );
        } else {
            const amount : A = ( this.constructor as any ).parse( value );

            return this.create( op( this.value, amount.as( this.unit ) ), this.unit );
        }
    }

    protected ternaryOp ( value1 : number | string | A, value2 : number | string | A, op : ( a : number, b : number, c : number ) => number ) {
        const value1Number = typeof value1 === 'number' ? value1 : ( this.constructor as any ).parse( value1 ).as( this.unit );
        const value2Number = typeof value2 === 'number' ? value2 : ( this.constructor as any ).parse( value2 ).as( this.unit );

        return this.create( op( this.value, value1Number, value2Number ), this.unit );
    }

    convert ( unit : U ) : A {
        const value = this.as( unit );
        
        if ( value === null ) {
            return null;
        }

        return this.create( value, unit );
    }

    as ( unit : U = this.unit, decimals : number = null ) : number {
        // If invalid unit
        if ( unit < 0 || unit >= this.exchangeRates.length ) {
            return null;
        }

        let value = this.value;

        if ( unit < this.unit ) {
            for ( let i : number = this.unit; i > unit; i-- ) {
                value *= this.exchangeRates[ i ].multiplier;
            }
        } else if ( unit > this.unit ) {
            for ( let i : number = this.unit + 1; i <= unit; i++ ) {
                value /= this.exchangeRates[ i ].multiplier;
            }
        }

        if ( typeof decimals === 'number' ) {
            if ( decimals > 0 ) {
                const exp = Math.pow( 10, decimals );
    
                value = Math.round( value * exp ) / exp;
            } else if ( decimals === 0 ) {
                value = Math.round( value );
            }
        }

        return value;
    }

    div ( value : number | string | A ) {
        return this.binaryOp( value, ( a, b ) => a / b );
    }

    mul ( value : number | string | A ) {
        return this.binaryOp( value, ( a, b ) => a * b );
    }

    plus ( value : number | string | A ) {
        return this.binaryOp( value, ( a, b ) => a + b );
    }

    minus ( value : number | string | A ) {
        return this.binaryOp( value, ( a, b ) => a - b );
    }

    floor () {
        return this.unaryOp( a => Math.floor( a ) );
    }
    
    ceil () {
        return this.unaryOp( a => Math.ceil( a ) );
    }
    
    round ( decimals : number = 0 ) {
        if ( decimals > 0 ) {
            const exp = Math.pow( 10, decimals );

            return this.unaryOp( a => Math.round( a * exp ) / exp );
        } else {
            return this.unaryOp( a => Math.round( a ) );
        }
    }

    clamp ( min : number | string | A, max : number | string | A ) {
        return this.ternaryOp( min, max, ( v, min, max ) => Math.max( min, Math.min( v, max ) ) );
    }

    atMost ( max : number | string | A ) {
        return this.binaryOp( max, ( v, max ) => Math.min( v, max ) );
    }

    atLeast ( min : number | string | A ) {
        return this.binaryOp( min, ( v, min ) => Math.max( v, min ) );
    }

    unitToString () {
        return '' + this.unit;
    }

    toHuman () {
        let cursor : A = this as any, backtrack : A = this as any;

        if ( cursor.value < 1 ) {
            // We'll go lower
            while ( cursor != null ) {
                cursor = cursor.convert( cursor.previousUnit );

                // Test if the lower unit is still bigger than 1
                // If not, cancel the search and we will use the value saved on backtrack as the closest we got
                if ( cursor == null || cursor.value < 1 ) {
                    break;
                }

                backtrack = cursor;
            }
        } else {
            // We'll go up
            while ( cursor != null ) {
                cursor = cursor.convert( cursor.nextUnit );
                
                // Test if the lower unit is still bigger than 1
                // If not, cancel the search and we will use the value saved on backtrack as the closest we got
                if ( cursor == null || cursor.value < 1 ) {
                    break;
                }

                backtrack = cursor;
            }
        }

        return backtrack;
    }

    toHumanString () {
        return this.toHuman().toString();
    }

    toString () {
        return `${this.value} ${ this.unitToString() }`;
    }
}
