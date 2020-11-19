const { expect } = require("chai");
const { ethers } = require("hardhat");
const { stringify } = require('flatted');

describe("Splitter", async function () {
  let splitter, alice, bob, carol, attacker;

  beforeEach(async () => {
    ([alice, bob, carol, attacker] = await ethers.getSigners());
    const Splitter = await ethers.getContractFactory("Splitter");
    splitter = await Splitter.deploy(bob.address, carol.address);
    await splitter.deployed();
  });

  it("should assign all participants' addresses when deploying", async function () {
    expect(await splitter.alice()).to.equal(alice.address);
    expect(await splitter.bob()).to.equal(bob.address);
    expect(await splitter.carol()).to.equal(carol.address);
  });

  it("should let alice deposit to her own balance", async function () {
    const value = ethers.utils.parseEther("1.0");
    splitter.deposit(false, { value });
    expect(await splitter.balances(alice.address)).to.equal(value);
    expect(await ethers.provider.getBalance(splitter.address)).to.equal(value);
  });

  it("should let alice split her deposit between bob & carol", async function () {
    const value = ethers.utils.parseEther("1.0");
    splitter.deposit(true, { value });
    expect(await splitter.balances(bob.address)).to.equal(value.div(2));
    expect(await splitter.balances(carol.address)).to.equal(value.div(2));
    expect(await ethers.provider.getBalance(splitter.address)).to.equal(value);
  });

  it("should only allow alice to deposit", async function () {
    const value = ethers.utils.parseEther("1.0");
    await expect(splitter.connect(bob).deposit(true, { value })).to.be.revertedWith('You lack deposit permission');
  })

  it("should prevent withdrawals if user has no balance", async function () {
    const value = ethers.utils.parseEther("1.0");
    splitter.deposit(false, { value });
    await expect(splitter.connect(bob).withdraw(value)).to.be.revertedWith('You have no balance');
    await expect(splitter.connect(carol).withdraw(value)).to.be.revertedWith('You have no balance');
  })

  it("should prevent withdrawals from unpermissioned addresses", async function () {
    const value = ethers.utils.parseEther("1.0");
    await expect(splitter.connect(attacker).withdraw(value)).to.be.revertedWith('Address not found');
  })

  it("withdraw funds", async function () {
    const value = ethers.utils.parseEther("1.0");
    await splitter.deposit(false, { value });
    await splitter.deposit(true, { value });

    await splitter.connect(alice).withdraw(value);
    await splitter.connect(bob).withdraw(value.div(2));
    await splitter.connect(carol).withdraw(value.div(2));

    expect(await splitter.balances(bob.address)).to.equal(0);
    expect(await splitter.balances(carol.address)).to.equal(0);
    expect(await splitter.balances(alice.address)).to.equal(0);
    expect(await ethers.provider.getBalance(splitter.address)).to.equal(0);
  })
});
