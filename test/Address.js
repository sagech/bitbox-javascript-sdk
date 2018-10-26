"use strict";
const fixtures = require("./fixtures/Address.json");
const chai = require("chai");
const assert = require("assert");
const BITBOXSDK = require("./../lib/bitbox-sdk").default;
const BITBOX = new BITBOXSDK();
const axios = require("axios");
const sinon = require("sinon");
const Bitcoin = require("bitcoincashjs-lib");

function flatten(arrays) {
  return [].concat.apply([], arrays);
}

const XPUBS = flatten([fixtures.mainnetXPub, fixtures.testnetXPub]);

const LEGACY_ADDRESSES = flatten([
  fixtures.legacyMainnetP2PKH,
  fixtures.legacyMainnetP2SH,
  fixtures.legacyTestnetP2PKH
]);

const mainnet_xpubs = [];
fixtures.mainnetXPub.forEach((f, i) => {
  mainnet_xpubs.push(f.xpub);
});
const MAINNET_ADDRESSES = flatten([
  mainnet_xpubs,
  fixtures.legacyMainnetP2PKH,
  fixtures.legacyMainnetP2SH,
  fixtures.cashaddrMainnetP2PKH
]);

const testnet_xpubs = [];
fixtures.testnetXPub.forEach((f, i) => {
  testnet_xpubs.push(f.xpub);
});
const TESTNET_ADDRESSES = flatten([
  testnet_xpubs,
  fixtures.legacyTestnetP2PKH,
  fixtures.cashaddrTestnetP2PKH
]);

const CASHADDR_ADDRESSES = flatten([
  fixtures.cashaddrMainnetP2PKH,
  fixtures.cashaddrMainnetP2SH,
  fixtures.cashaddrTestnetP2PKH
]);

const CASHADDR_ADDRESSES_NO_PREFIX = CASHADDR_ADDRESSES.map(address => {
  const parts = address.split(":");
  return parts[1];
});

const REGTEST_ADDRESSES = fixtures.cashaddrRegTestP2PKH;

const REGTEST_ADDRESSES_NO_PREFIX = REGTEST_ADDRESSES.map(address => {
  const parts = address.split(":");
  return parts[1];
});

const HASH160_HASHES = flatten([
  fixtures.hash160MainnetP2PKH,
  fixtures.hash160MainnetP2SH,
  fixtures.hash160TestnetP2PKH
]);

const P2PKH_ADDRESSES = flatten([
  fixtures.legacyMainnetP2PKH,
  fixtures.legacyTestnetP2PKH,
  fixtures.cashaddrMainnetP2PKH,
  fixtures.cashaddrTestnetP2PKH,
  fixtures.cashaddrRegTestP2PKH
]);

const P2SH_ADDRESSES = flatten([
  fixtures.legacyMainnetP2SH,
  fixtures.cashaddrMainnetP2SH
]);

describe("#addressConversion", () => {
  describe("#toLegacyAddress", () => {
    it("should translate legacy address format to itself correctly", () => {
      assert.deepEqual(
        LEGACY_ADDRESSES.map(address =>
          BITBOX.Address.toLegacyAddress(address)
        ),
        LEGACY_ADDRESSES
      );
    });

    it("should convert cashaddr address to legacy base58Check", () => {
      assert.deepEqual(
        CASHADDR_ADDRESSES.map(address =>
          BITBOX.Address.toLegacyAddress(address)
        ),
        LEGACY_ADDRESSES
      );
    });

    it("should convert cashaddr regtest address to legacy base58Check", () => {
      assert.deepEqual(
        REGTEST_ADDRESSES.map(address =>
          BITBOX.Address.toLegacyAddress(address)
        ),
        fixtures.legacyTestnetP2PKH
      );
    });

    describe("errors", () => {
      it("should fail when called with an invalid address", () => {
        assert.throws(() => {
          BITBOX.Address.toLegacyAddress();
        }, BITBOX.BitcoinCash.InvalidAddressError);
        assert.throws(() => {
          BITBOX.Address.toLegacyAddress("some invalid address");
        }, BITBOX.BitcoinCash.InvalidAddressError);
      });
    });
  });

  describe("#toCashAddress", () => {
    it("should convert legacy base58Check address to cashaddr", () => {
      assert.deepEqual(
        LEGACY_ADDRESSES.map(address =>
          BITBOX.Address.toCashAddress(address, true)
        ),
        CASHADDR_ADDRESSES
      );
    });

    it("should convert legacy base58Check address to regtest cashaddr", () => {
      assert.deepEqual(
        fixtures.legacyTestnetP2PKH.map(address =>
          BITBOX.Address.toCashAddress(address, true, true)
        ),
        REGTEST_ADDRESSES
      );
    });

    it("should translate cashaddr address format to itself correctly", () => {
      assert.deepEqual(
        CASHADDR_ADDRESSES.map(address =>
          BITBOX.Address.toCashAddress(address, true)
        ),
        CASHADDR_ADDRESSES
      );
    });

    it("should translate regtest cashaddr address format to itself correctly", () => {
      assert.deepEqual(
        REGTEST_ADDRESSES.map(address =>
          BITBOX.Address.toCashAddress(address, true, true)
        ),
        REGTEST_ADDRESSES
      );
    });

    it("should translate no-prefix cashaddr address format to itself correctly", () => {
      assert.deepEqual(
        CASHADDR_ADDRESSES_NO_PREFIX.map(address =>
          BITBOX.Address.toCashAddress(address, true)
        ),
        CASHADDR_ADDRESSES
      );
    });

    it("should translate no-prefix regtest cashaddr address format to itself correctly", () => {
      assert.deepEqual(
        REGTEST_ADDRESSES_NO_PREFIX.map(address =>
          BITBOX.Address.toCashAddress(address, true, true)
        ),
        REGTEST_ADDRESSES
      );
    });

    it("should translate cashaddr address format to itself of no-prefix correctly", () => {
      CASHADDR_ADDRESSES.forEach(address => {
        const noPrefix = BITBOX.Address.toCashAddress(address, false);
        assert.equal(address.split(":")[1], noPrefix);
      });
    });

    it("should translate regtest cashaddr address format to itself of no-prefix correctly", () => {
      REGTEST_ADDRESSES.forEach(address => {
        const noPrefix = BITBOX.Address.toCashAddress(address, false, true);
        assert.equal(address.split(":")[1], noPrefix);
      });
    });

    describe("errors", () => {
      it("should fail when called with an invalid address", () => {
        assert.throws(() => {
          BITBOX.BitcoinCash.Address.toCashAddress();
        }, BITBOX.BitcoinCash.InvalidAddressError);
        assert.throws(() => {
          BITBOX.BitcoinCash.Address.toCashAddress("some invalid address");
        }, BITBOX.BitcoinCash.InvalidAddressError);
      });
    });
  });
  describe("#toHash160", () => {
    it("should convert legacy base58check address to hash160", () => {
      assert.deepEqual(
        LEGACY_ADDRESSES.map(address => BITBOX.Address.toHash160(address)),
        HASH160_HASHES
      );
    });

    it("should convert cashaddr address to hash160", () => {
      assert.deepEqual(
        CASHADDR_ADDRESSES.map(address => BITBOX.Address.toHash160(address)),
        HASH160_HASHES
      );
    });

    it("should convert　regtest cashaddr address to hash160", () => {
      assert.deepEqual(
        REGTEST_ADDRESSES.map(address => BITBOX.Address.toHash160(address)),
        fixtures.hash160TestnetP2PKH
      );
    });

    describe("errors", () => {
      it("should fail when called with an invalid address", () => {
        assert.throws(() => {
          BITBOX.Address.toHash160();
        }, BITBOX.BitcoinCash.InvalidAddressError);
        assert.throws(() => {
          BITBOX.Address.toHash160("some invalid address");
        }, BITBOX.BitcoinCash.InvalidAddressError);
      });
    });
  });
  describe("#fromHash160", () => {
    it("should convert hash160 to mainnet P2PKH legacy base58check address", () => {
      assert.deepEqual(
        fixtures.hash160MainnetP2PKH.map(hash160 =>
          BITBOX.Address.hash160ToLegacy(hash160)
        ),
        fixtures.legacyMainnetP2PKH
      );
    });

    it("should convert hash160 to mainnet P2SH legacy base58check address", () => {
      assert.deepEqual(
        fixtures.hash160MainnetP2SH.map(hash160 =>
          BITBOX.Address.hash160ToLegacy(
            hash160,
            Bitcoin.networks.bitcoin.scriptHash
          )
        ),
        fixtures.legacyMainnetP2SH
      );
    });

    it("should convert hash160 to testnet P2PKH legacy base58check address", () => {
      assert.deepEqual(
        fixtures.hash160TestnetP2PKH.map(hash160 =>
          BITBOX.Address.hash160ToLegacy(
            hash160,
            Bitcoin.networks.testnet.pubKeyHash
          )
        ),
        fixtures.legacyTestnetP2PKH
      );
    });

    it("should convert hash160 to mainnet P2PKH cash address", () => {
      assert.deepEqual(
        fixtures.hash160MainnetP2PKH.map(hash160 =>
          BITBOX.Address.hash160ToCash(hash160)
        ),
        fixtures.cashaddrMainnetP2PKH
      );
    });

    it("should convert hash160 to mainnet P2SH cash address", () => {
      assert.deepEqual(
        fixtures.hash160MainnetP2SH.map(hash160 =>
          BITBOX.Address.hash160ToCash(
            hash160,
            Bitcoin.networks.bitcoin.scriptHash
          )
        ),
        fixtures.cashaddrMainnetP2SH
      );
    });

    it("should convert hash160 to testnet P2PKH cash address", () => {
      assert.deepEqual(
        fixtures.hash160TestnetP2PKH.map(hash160 =>
          BITBOX.Address.hash160ToCash(
            hash160,
            Bitcoin.networks.testnet.pubKeyHash
          )
        ),
        fixtures.cashaddrTestnetP2PKH
      );
    });

    it("should convert hash160 to regtest P2PKH cash address", () => {
      assert.deepEqual(
        fixtures.hash160TestnetP2PKH.map(hash160 =>
          BITBOX.Address.hash160ToCash(
            hash160,
            Bitcoin.networks.testnet.pubKeyHash,
            true
          )
        ),
        REGTEST_ADDRESSES
      );
    });

    describe("errors", () => {
      it("should fail when called with an invalid address", () => {
        assert.throws(() => {
          BITBOX.Address.hash160ToLegacy();
        }, BITBOX.BitcoinCash.InvalidAddressError);
        assert.throws(() => {
          BITBOX.Address.hash160ToLegacy("some invalid address");
        }, BITBOX.BitcoinCash.InvalidAddressError);
        assert.throws(() => {
          BITBOX.Address.hash160ToCash();
        }, BITBOX.BitcoinCash.InvalidAddressError);
        assert.throws(() => {
          BITBOX.Address.hash160ToCash("some invalid address");
        }, BITBOX.BitcoinCash.InvalidAddressError);
      });
    });
  });
});

describe("address format detection", () => {
  describe("#isLegacyAddress", () => {
    describe("is legacy", () => {
      LEGACY_ADDRESSES.forEach(address => {
        it(`should detect ${address} is a legacy base58Check address`, () => {
          const isBase58Check = BITBOX.Address.isLegacyAddress(address);
          assert.equal(isBase58Check, true);
        });
      });
    });
    describe("is not legacy", () => {
      CASHADDR_ADDRESSES.forEach(address => {
        it(`should detect ${address} is not a legacy address`, () => {
          const isBase58Check = BITBOX.Address.isLegacyAddress(address);
          assert.equal(isBase58Check, false);
        });
      });

      REGTEST_ADDRESSES.forEach(address => {
        it(`should detect ${address} is not a legacy address`, () => {
          const isBase58Check = BITBOX.Address.isLegacyAddress(address);
          assert.equal(isBase58Check, false);
        });
      });
    });

    describe("errors", () => {
      it("should fail when called with an invalid address", () => {
        assert.throws(() => {
          BITBOX.Address.isLegacyAddress();
        }, BITBOX.BitcoinCash.InvalidAddressError);
        assert.throws(() => {
          BITBOX.Address.isLegacyAddress("some invalid address");
        }, BITBOX.BitcoinCash.InvalidAddressError);
      });
    });
  });

  describe("#isCashAddress", () => {
    describe("is cashaddr", () => {
      CASHADDR_ADDRESSES.forEach(address => {
        it(`should detect ${address} is a cashaddr address`, () => {
          const isCashaddr = BITBOX.Address.isCashAddress(address);
          assert.equal(isCashaddr, true);
        });
      });

      REGTEST_ADDRESSES.forEach(address => {
        it(`should detect ${address} is a cashaddr address`, () => {
          const isCashaddr = BITBOX.Address.isCashAddress(address);
          assert.equal(isCashaddr, true);
        });
      });
    });

    describe("is not cashaddr", () => {
      LEGACY_ADDRESSES.forEach(address => {
        it(`should detect ${address} is not a cashaddr address`, () => {
          const isCashaddr = BITBOX.Address.isCashAddress(address);
          assert.equal(isCashaddr, false);
        });
      });
    });

    describe("errors", () => {
      it("should fail when called with an invalid address", () => {
        assert.throws(() => {
          BITBOX.Address.isCashAddress();
        }, BITBOX.BitcoinCash.InvalidAddressError);
        assert.throws(() => {
          BITBOX.Address.isCashAddress("some invalid address");
        }, BITBOX.BitcoinCash.InvalidAddressError);
      });
    });
  });
  describe("#isHash160", () => {
    describe("is hash160", () => {
      HASH160_HASHES.forEach(address => {
        it(`should detect ${address} is a hash160 hash`, () => {
          const isHash160 = BITBOX.Address.isHash160(address);
          assert.equal(isHash160, true);
        });
      });
    });
    describe("is not hash160", () => {
      LEGACY_ADDRESSES.forEach(address => {
        it(`should detect ${address} is not a hash160 hash`, () => {
          const isHash160 = BITBOX.Address.isHash160(address);
          assert.equal(isHash160, false);
        });
      });

      CASHADDR_ADDRESSES.forEach(address => {
        it(`should detect ${address} is not a hash160 hash`, () => {
          const isHash160 = BITBOX.Address.isHash160(address);
          assert.equal(isHash160, false);
        });
      });

      REGTEST_ADDRESSES.forEach(address => {
        it(`should detect ${address} is not a legacy address`, () => {
          const isHash160 = BITBOX.Address.isHash160(address);
          assert.equal(isHash160, false);
        });
      });
    });

    describe("errors", () => {
      it("should fail when called with an invalid address", () => {
        assert.throws(() => {
          BITBOX.Address.isHash160();
        }, BITBOX.BitcoinCash.InvalidAddressError);
        assert.throws(() => {
          BITBOX.Address.isHash160("some invalid address");
        }, BITBOX.BitcoinCash.InvalidAddressError);
      });
    });
  });
});

describe("network detection", () => {
  describe("#isMainnetAddress", () => {
    describe("is mainnet", () => {
      MAINNET_ADDRESSES.forEach(address => {
        it(`should detect ${address} is a mainnet address`, () => {
          const isMainnet = BITBOX.Address.isMainnetAddress(address);
          assert.equal(isMainnet, true);
        });
      });
    });

    describe("is not mainnet", () => {
      TESTNET_ADDRESSES.forEach(address => {
        it(`should detect ${address} is not a mainnet address`, () => {
          const isMainnet = BITBOX.Address.isMainnetAddress(address);
          assert.equal(isMainnet, false);
        });
      });

      REGTEST_ADDRESSES.forEach(address => {
        it(`should detect ${address} is not a mainnet address`, () => {
          const isMainnet = BITBOX.Address.isMainnetAddress(address);
          assert.equal(isMainnet, false);
        });
      });
    });

    describe("errors", () => {
      it("should fail when called with an invalid address", () => {
        assert.throws(() => {
          BITBOX.Address.isMainnetAddress();
        }, BITBOX.BitcoinCash.InvalidAddressError);
        assert.throws(() => {
          BITBOX.Address.isMainnetAddress("some invalid address");
        }, BITBOX.BitcoinCash.InvalidAddressError);
      });
    });
  });

  describe("#isTestnetAddress", () => {
    describe("is testnet", () => {
      TESTNET_ADDRESSES.forEach(address => {
        it(`should detect ${address} is a testnet address`, () => {
          const isTestnet = BITBOX.Address.isTestnetAddress(address);
          assert.equal(isTestnet, true);
        });
      });
    });

    describe("is not testnet", () => {
      MAINNET_ADDRESSES.forEach(address => {
        it(`should detect ${address} is not a testnet address`, () => {
          const isTestnet = BITBOX.Address.isTestnetAddress(address);
          assert.equal(isTestnet, false);
        });
      });

      REGTEST_ADDRESSES.forEach(address => {
        it(`should detect ${address} is not a testnet address`, () => {
          const isTestnet = BITBOX.Address.isTestnetAddress(address);
          assert.equal(isTestnet, false);
        });
      });
    });

    describe("errors", () => {
      it("should fail when called with an invalid address", () => {
        assert.throws(() => {
          BITBOX.Address.isTestnetAddress();
        }, BITBOX.BitcoinCash.InvalidAddressError);
        assert.throws(() => {
          BITBOX.Address.isTestnetAddress("some invalid address");
        }, BITBOX.BitcoinCash.InvalidAddressError);
      });
    });
  });

  describe("#isRegTestAddress", () => {
    describe("is testnet", () => {
      REGTEST_ADDRESSES.forEach(address => {
        it(`should detect ${address} is a regtest address`, () => {
          const isRegTest = BITBOX.Address.isRegTestAddress(address);
          assert.equal(isRegTest, true);
        });
      });
    });

    describe("is not testnet", () => {
      MAINNET_ADDRESSES.forEach(address => {
        it(`should detect ${address} is not a regtest address`, () => {
          const isRegTest = BITBOX.Address.isRegTestAddress(address);
          assert.equal(isRegTest, false);
        });
      });

      TESTNET_ADDRESSES.forEach(address => {
        it(`should detect ${address} is not a regtest address`, () => {
          const isRegTest = BITBOX.Address.isRegTestAddress(address);
          assert.equal(isRegTest, false);
        });
      });
    });

    describe("errors", () => {
      it("should fail when called with an invalid address", () => {
        assert.throws(() => {
          BITBOX.Address.isRegTestAddress();
        }, BITBOX.BitcoinCash.InvalidAddressError);
        assert.throws(() => {
          BITBOX.Address.isRegTestAddress("some invalid address");
        }, BITBOX.BitcoinCash.InvalidAddressError);
      });
    });
  });
});

describe("address type detection", () => {
  describe("#isP2PKHAddress", () => {
    describe("is P2PKH", () => {
      P2PKH_ADDRESSES.forEach(address => {
        it(`should detect ${address} is a P2PKH address`, () => {
          const isP2PKH = BITBOX.Address.isP2PKHAddress(address);
          assert.equal(isP2PKH, true);
        });
      });
    });

    describe("is not P2PKH", () => {
      P2SH_ADDRESSES.forEach(address => {
        it(`should detect ${address} is not a P2PKH address`, () => {
          const isP2PKH = BITBOX.Address.isP2PKHAddress(address);
          assert.equal(isP2PKH, false);
        });
      });
    });

    describe("errors", () => {
      it("should fail when called with an invalid address", () => {
        assert.throws(() => {
          BITBOX.Address.isP2PKHAddress();
        }, BITBOX.BitcoinCash.InvalidAddressError);
        assert.throws(() => {
          BITBOX.Address.isP2PKHAddress("some invalid address");
        }, BITBOX.BitcoinCash.InvalidAddressError);
      });
    });
  });

  describe("#isP2SHAddress", () => {
    describe("is P2SH", () => {
      P2SH_ADDRESSES.forEach(address => {
        it(`should detect ${address} is a P2SH address`, () => {
          const isP2SH = BITBOX.Address.isP2SHAddress(address);
          assert.equal(isP2SH, true);
        });
      });
    });

    describe("is not P2SH", () => {
      P2PKH_ADDRESSES.forEach(address => {
        it(`should detect ${address} is not a P2SH address`, () => {
          const isP2SH = BITBOX.Address.isP2SHAddress(address);
          assert.equal(isP2SH, false);
        });
      });
    });

    describe("errors", () => {
      it("should fail when called with an invalid address", () => {
        assert.throws(() => {
          BITBOX.Address.isP2SHAddress();
        }, BITBOX.BitcoinCash.InvalidAddressError);
        assert.throws(() => {
          BITBOX.Address.isP2SHAddress("some invalid address");
        }, BITBOX.BitcoinCash.InvalidAddressError);
      });
    });
  });
});

describe("cashaddr prefix detection", () => {
  it("should return the same result for detectAddressFormat", () => {
    assert.deepEqual(
      CASHADDR_ADDRESSES_NO_PREFIX.map(address =>
        BITBOX.Address.detectAddressFormat(address)
      ),
      CASHADDR_ADDRESSES.map(address =>
        BITBOX.Address.detectAddressFormat(address)
      )
    );
    assert.deepEqual(
      REGTEST_ADDRESSES_NO_PREFIX.map(address =>
        BITBOX.Address.detectAddressFormat(address)
      ),
      REGTEST_ADDRESSES.map(address =>
        BITBOX.Address.detectAddressFormat(address)
      )
    );
  });
  it("should return the same result for detectAddressNetwork", () => {
    assert.deepEqual(
      CASHADDR_ADDRESSES_NO_PREFIX.map(address =>
        BITBOX.Address.detectAddressNetwork(address)
      ),
      CASHADDR_ADDRESSES.map(address =>
        BITBOX.Address.detectAddressNetwork(address)
      )
    );
    assert.deepEqual(
      REGTEST_ADDRESSES_NO_PREFIX.map(address =>
        BITBOX.Address.detectAddressNetwork(address)
      ),
      REGTEST_ADDRESSES.map(address =>
        BITBOX.Address.detectAddressNetwork(address)
      )
    );
  });
  it("should return the same result for detectAddressType", () => {
    assert.deepEqual(
      CASHADDR_ADDRESSES_NO_PREFIX.map(address =>
        BITBOX.Address.detectAddressType(address)
      ),
      CASHADDR_ADDRESSES.map(address =>
        BITBOX.Address.detectAddressType(address)
      )
    );
    assert.deepEqual(
      REGTEST_ADDRESSES_NO_PREFIX.map(address =>
        BITBOX.Address.detectAddressType(address)
      ),
      REGTEST_ADDRESSES.map(address =>
        BITBOX.Address.detectAddressType(address)
      )
    );
  });
  it("should return the same result for toLegacyAddress", () => {
    assert.deepEqual(
      CASHADDR_ADDRESSES_NO_PREFIX.map(address =>
        BITBOX.Address.toLegacyAddress(address)
      ),
      CASHADDR_ADDRESSES.map(address => BITBOX.Address.toLegacyAddress(address))
    );
    assert.deepEqual(
      REGTEST_ADDRESSES_NO_PREFIX.map(address =>
        BITBOX.Address.toLegacyAddress(address)
      ),
      REGTEST_ADDRESSES.map(address => BITBOX.Address.toLegacyAddress(address))
    );
  });
  it("should return the same result for isLegacyAddress", () => {
    assert.deepEqual(
      CASHADDR_ADDRESSES_NO_PREFIX.map(address =>
        BITBOX.Address.isLegacyAddress(address)
      ),
      CASHADDR_ADDRESSES.map(address => BITBOX.Address.isLegacyAddress(address))
    );
    assert.deepEqual(
      REGTEST_ADDRESSES_NO_PREFIX.map(address =>
        BITBOX.Address.isLegacyAddress(address)
      ),
      REGTEST_ADDRESSES.map(address => BITBOX.Address.isLegacyAddress(address))
    );
  });
  it("should return the same result for isCashAddress", () => {
    assert.deepEqual(
      CASHADDR_ADDRESSES_NO_PREFIX.map(address =>
        BITBOX.Address.isCashAddress(address)
      ),
      CASHADDR_ADDRESSES.map(address => BITBOX.Address.isCashAddress(address))
    );
    assert.deepEqual(
      REGTEST_ADDRESSES_NO_PREFIX.map(address =>
        BITBOX.Address.isCashAddress(address)
      ),
      REGTEST_ADDRESSES.map(address => BITBOX.Address.isCashAddress(address))
    );
  });
  it("should return the same result for isMainnetAddress", () => {
    assert.deepEqual(
      CASHADDR_ADDRESSES_NO_PREFIX.map(address =>
        BITBOX.Address.isMainnetAddress(address)
      ),
      CASHADDR_ADDRESSES.map(address =>
        BITBOX.Address.isMainnetAddress(address)
      )
    );
    assert.deepEqual(
      REGTEST_ADDRESSES_NO_PREFIX.map(address =>
        BITBOX.Address.isMainnetAddress(address)
      ),
      REGTEST_ADDRESSES.map(address => BITBOX.Address.isMainnetAddress(address))
    );
  });
  it("should return the same result for isTestnetAddress", () => {
    assert.deepEqual(
      CASHADDR_ADDRESSES_NO_PREFIX.map(address =>
        BITBOX.Address.isTestnetAddress(address)
      ),
      CASHADDR_ADDRESSES.map(address =>
        BITBOX.Address.isTestnetAddress(address)
      )
    );
    assert.deepEqual(
      REGTEST_ADDRESSES_NO_PREFIX.map(address =>
        BITBOX.Address.isTestnetAddress(address)
      ),
      REGTEST_ADDRESSES.map(address => BITBOX.Address.isTestnetAddress(address))
    );
  });
  it("should return the same result for isP2PKHAddress", () => {
    assert.deepEqual(
      CASHADDR_ADDRESSES_NO_PREFIX.map(address =>
        BITBOX.Address.isP2PKHAddress(address)
      ),
      CASHADDR_ADDRESSES.map(address => BITBOX.Address.isP2PKHAddress(address))
    );
    assert.deepEqual(
      REGTEST_ADDRESSES_NO_PREFIX.map(address =>
        BITBOX.Address.isP2PKHAddress(address)
      ),
      REGTEST_ADDRESSES.map(address => BITBOX.Address.isP2PKHAddress(address))
    );
  });
  it("should return the same result for isP2SHAddress", () => {
    assert.deepEqual(
      CASHADDR_ADDRESSES_NO_PREFIX.map(address =>
        BITBOX.Address.isP2SHAddress(address)
      ),
      CASHADDR_ADDRESSES.map(address => BITBOX.Address.isP2SHAddress(address))
    );
    assert.deepEqual(
      REGTEST_ADDRESSES_NO_PREFIX.map(address =>
        BITBOX.Address.isP2SHAddress(address)
      ),
      REGTEST_ADDRESSES.map(address => BITBOX.Address.isP2SHAddress(address))
    );
  });
});

describe("#detectAddressFormat", () => {
  LEGACY_ADDRESSES.forEach(address => {
    it(`should detect ${address} is a legacy base58Check address`, () => {
      const isBase58Check = BITBOX.Address.detectAddressFormat(address);
      assert.equal(isBase58Check, "legacy");
    });
  });

  CASHADDR_ADDRESSES.forEach(address => {
    it(`should detect ${address} is a legacy cashaddr address`, () => {
      const isCashaddr = BITBOX.Address.detectAddressFormat(address);
      assert.equal(isCashaddr, "cashaddr");
    });
  });

  REGTEST_ADDRESSES.forEach(address => {
    it(`should detect ${address} is a legacy cashaddr address`, () => {
      const isCashaddr = BITBOX.Address.detectAddressFormat(address);
      assert.equal(isCashaddr, "cashaddr");
    });
  });

  describe("errors", () => {
    it("should fail when called with an invalid address", () => {
      assert.throws(() => {
        BITBOX.Address.detectAddressFormat();
      }, BITBOX.BitcoinCash.InvalidAddressError);
      assert.throws(() => {
        BITBOX.Address.detectAddressFormat("some invalid address");
      }, BITBOX.BitcoinCash.InvalidAddressError);
    });
  });
});

describe("#detectAddressNetwork", () => {
  MAINNET_ADDRESSES.forEach(address => {
    it(`should detect ${address} is a mainnet address`, () => {
      const isMainnet = BITBOX.Address.detectAddressNetwork(address);
      assert.equal(isMainnet, "mainnet");
    });
  });

  TESTNET_ADDRESSES.forEach(address => {
    it(`should detect ${address} is a testnet address`, () => {
      const isTestnet = BITBOX.Address.detectAddressNetwork(address);
      assert.equal(isTestnet, "testnet");
    });
  });

  REGTEST_ADDRESSES.forEach(address => {
    it(`should detect ${address} is a testnet address`, () => {
      const isTestnet = BITBOX.Address.detectAddressNetwork(address);
      assert.equal(isTestnet, "regtest");
    });
  });

  describe("errors", () => {
    it("should fail when called with an invalid address", () => {
      assert.throws(() => {
        BITBOX.Address.detectAddressNetwork();
      }, BITBOX.BitcoinCash.InvalidAddressError);
      assert.throws(() => {
        BITBOX.Address.detectAddressNetwork("some invalid address");
      }, BITBOX.BitcoinCash.InvalidAddressError);
    });
  });
});

describe("#detectAddressType", () => {
  P2PKH_ADDRESSES.forEach(address => {
    it(`should detect ${address} is a P2PKH address`, () => {
      const isP2PKH = BITBOX.Address.detectAddressType(address);
      assert.equal(isP2PKH, "p2pkh");
    });
  });

  P2SH_ADDRESSES.forEach(address => {
    it(`should detect ${address} is a P2SH address`, () => {
      const isP2SH = BITBOX.Address.detectAddressType(address);
      assert.equal(isP2SH, "p2sh");
    });
  });

  describe("errors", () => {
    it("should fail when called with an invalid address", () => {
      assert.throws(() => {
        BITBOX.Address.detectAddressType();
      }, BITBOX.BitcoinCash.InvalidAddressError);
      assert.throws(() => {
        BITBOX.Address.detectAddressType("some invalid address");
      }, BITBOX.BitcoinCash.InvalidAddressError);
    });
  });
});

describe("#fromXPub", () => {
  XPUBS.forEach((xpub, i) => {
    xpub.addresses.forEach((address, j) => {
      it(`generate public external change address ${j} for ${
        xpub.xpub
      }`, () => {
        assert.equal(BITBOX.Address.fromXPub(xpub.xpub, `0/${j}`), address);
      });
    });
  });
});

describe("#fromOutputScript", () => {
  const script = BITBOX.Script.encode([
    Buffer.from("BOX", "ascii"),
    BITBOX.Script.opcodes.OP_CAT,
    Buffer.from("BITBOX", "ascii"),
    BITBOX.Script.opcodes.OP_EQUAL
  ]);

  // hash160 script buffer
  const p2sh_hash160 = BITBOX.Crypto.hash160(script);

  // encode hash160 as P2SH output
  const scriptPubKey = BITBOX.Script.scriptHash.output.encode(p2sh_hash160);
  const p2shAddress = BITBOX.Address.fromOutputScript(scriptPubKey);
  fixtures.p2shMainnet.forEach((address, i) => {
    it(`generate address from output script`, () => {
      assert.equal(p2shAddress, address);
    });
  });
});

describe("#details", () => {
  let sandbox;
  beforeEach(() => (sandbox = sinon.sandbox.create()));
  afterEach(() => sandbox.restore());

  it("should get details", done => {
    const data = {
      legacyAddress: "3CnzuFFbtgVyHNiDH8BknGo3PQ3dpdThgJ",
      cashAddress: "bitcoincash:ppuukp49np467kyzxl0fkla34rmgcddhvc33ce2d6l",
      balance: 300.0828874,
      balanceSat: 30008288740,
      totalReceived: 12945.45174649,
      totalReceivedSat: 1294545174649,
      totalSent: 12645.36885909,
      totalSentSat: 1264536885909,
      unconfirmedBalance: 0,
      unconfirmedBalanceSat: 0,
      unconfirmedTxApperances: 0,
      txApperances: 1042,
      transactions: [
        "b29425a876f62e114508e67e66b5eb1ab0d320d7c9a57fb0ece086a36e2b7309"
      ]
    };

    const resolved = new Promise(r => r({ data: data }));
    sandbox.stub(axios, "get").returns(resolved);

    BITBOX.Address.details(
      "bitcoincash:qrdka2205f4hyukutc2g0s6lykperc8nsu5u2ddpqf"
    )
      .then(result => {
        assert.deepEqual(data, result);
      })
      .then(done, done);
  });
});

describe("#utxo", () => {
  let sandbox;
  beforeEach(() => (sandbox = sinon.sandbox.create()));
  afterEach(() => sandbox.restore());

  it("should get utxo", done => {
    const data = [
      {
        legacyAddress: "3CnzuFFbtgVyHNiDH8BknGo3PQ3dpdThgJ",
        cashAddress: "bitcoincash:ppuukp49np467kyzxl0fkla34rmgcddhvc33ce2d6l",
        txid:
          "6f56254424378d6914cebd097579c70664843e5876ca86f0bf412ba7f3928326",
        vout: 0,
        scriptPubKey: "a91479cb06a5986baf588237de9b7fb1a8f68c35b76687",
        amount: 12.5002911,
        satoshis: 1250029110,
        height: 528745,
        confirmations: 17
      },
      {
        legacyAddress: "3CnzuFFbtgVyHNiDH8BknGo3PQ3dpdThgJ",
        cashAddress: "bitcoincash:ppuukp49np467kyzxl0fkla34rmgcddhvc33ce2d6l",
        txid:
          "b29425a876f62e114508e67e66b5eb1ab0d320d7c9a57fb0ece086a36e2b7309",
        vout: 0,
        scriptPubKey: "a91479cb06a5986baf588237de9b7fb1a8f68c35b76687",
        amount: 12.50069247,
        satoshis: 1250069247,
        height: 528744,
        confirmations: 18
      }
    ];
    const resolved = new Promise(r => r({ data: data }));
    sandbox.stub(axios, "get").returns(resolved);

    BITBOX.Address.utxo(
      "bitcoincash:ppuukp49np467kyzxl0fkla34rmgcddhvc33ce2d6l"
    )
      .then(result => {
        assert.deepEqual(data, result);
      })
      .then(done, done);
  });
});

describe("#unconfirmed", () => {
  let sandbox;
  beforeEach(() => (sandbox = sinon.sandbox.create()));
  afterEach(() => sandbox.restore());

  it("should get unconfirmed transactions", done => {
    const data = [
      {
        txid:
          "e0aadd861a06993e39af932bb0b9ad69e7b37ef5843a13c6724789e1c94f3513",
        vout: 1,
        scriptPubKey: "76a914a0f531f4ff810a415580c12e54a7072946bb927e88ac",
        amount: 0.00008273,
        satoshis: 8273,
        confirmations: 0,
        ts: 1526680569,
        legacyAddress: "1Fg4r9iDrEkCcDmHTy2T79EusNfhyQpu7W",
        cashAddress: "bitcoincash:qzs02v05l7qs5s24srqju498qu55dwuj0cx5ehjm2c"
      }
    ];
    const resolved = new Promise(r => r({ data: data }));
    sandbox.stub(axios, "get").returns(resolved);

    BITBOX.Address.unconfirmed(
      "bitcoincash:qzs02v05l7qs5s24srqju498qu55dwuj0cx5ehjm2c"
    )
      .then(result => {
        assert.deepEqual(data, result);
      })
      .then(done, done);
  });
});
