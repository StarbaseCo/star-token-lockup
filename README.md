# Star Token Lockup Smart Contract

## Table of Contents

* [Table of Contents](#table-of-contents)
* [Overview](#overview)
* [Implementation Details](#implementation-details)
* [Development](#development)

## Overview

The Star token lockup smart contract creates a vesting contract that vests its balance of STAR token for a beneficiary.
It release STAR token balance gradually like a typical vesting scheme, with a cliff and vesting period. Optionally revocable by the
owner.

## Implementation Details

StarLockup.sol
This contract's main functions are the `release` and `revoke` ones.

1. `release` is called to give the beneficiary any vested token so far in time.
2. `revoke` can be called by contract owner to revoke any unvested tokens. The contract needs to be revocable for it to work.

Note that STAR token must be allocated to this StarLockup contract address after its deployment. It is essential for its operation.

## Development

**Dependencies**

* `node@8.5.x`
* `truffle@^4.0.x`
* `ganache-cli@^6.0.x`
* `zeppelin-solidity@1.6.X`

## Setting Up

* Clone this repository.

* Install all [system dependencies](#development).

  * `cd truffle && npm install`

* Compile contract code

  * `node_modules/.bin/truffle compile`

## Running Tests

* `bash run_test.sh`

## License and Warranty

Be advised that while we strive to provide professional grade, tested code we cannot guarantee its fitness for your application. This is released under The MIT License (MIT) and as such we will not be held liable for lost funds, etc. Please use your best judgment and note the following:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
