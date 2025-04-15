# Contributor Guidelines

Thanks for taking some time out of your day to help make our project better! We truly appreciate it :heart:

This document explains different ways to help out with Scheddy, and details about how we'll handle it. Please read the relevant section before making your contribution. We look forward to reviewing it!

> Like Scheddy, but don't have time to contribute? That's fine. Do what's best for you, but know we'll always appreciate any help you can provide!

## Table of Contents

- [Code of Content](#code-of-conduct)
- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Code Contributions](#code-contributions)

## Code of Conduct

This project, all spaces surrounding it, and everyone participating in it is governed by both the [VATSIM Code of Conduct](https://vatsim.net/docs/policy/code-of-conduct) and [our own, adapted from the Contributor Covenant](CODE_OF_CONDUCT.md). By participating, you are expected to uphold the rules set out within both of these documents. Please report any unacceptable behavior to the maintainer @ <wm@ztlartcc.org>.

## I Have A Question

We're happy to help!

**Before you ask for help,** please search for any existing [issues](https://github.com/ZTL-ARTCC/scheddy/issues) that might help you, or match the problem you're seeing. If you find an issue that matches, but still need help, it's best to add it as a comment there. Rest assured, it's still being monitored!

If you still need help, please [open an issue](https://github.com/ZTL-ARTCC/scheddy/issues/new) and provide as much context as you can, as well as project and platform versions, depending on what seems relevant. Someone from our team will get back to you as soon as possible.

## I Want To Contribute

> ## Legal Mumbo Jumbo
>
> By contributing to Scheddy, you're agreeing to quite a few different things. Please check out [the dedicated section of this document](#the-paperwork) to give you an overview of your rights and responsibilities.

### Reporting Bugs

#### Before Submitting a Bug Report

A good bug report shouldn’t leave others needing to chase you up for more information. Therefore, we ask you to investigate carefully, collect information and describe the issue in detail in your report. Please complete the following steps in advance to help us fix any potential bug as fast as possible.

- Make sure that you are using the latest version.
- Determine if your bug is really a bug and not an error on your side e.g. using incompatible environment components/versions (Make sure that you have read the documentation. If you are looking for support, you might want to check this section).
- To see if other users have experienced (and potentially already solved) the same issue you are having, check if there is not already a bug report existing for your bug or error in the bug tracker.
- Also make sure to search the internet (including Stack Overflow) to see if users outside of the GitHub community have discussed the issue.
- Collect information about the bug:
  - If you got a crash message, grab that.
  - OS, Platform and Version (Windows, Linux, macOS, x86, ARM)
  - Possibly your input and the output
  - Can you reliably reproduce the issue, or did it just happen once?
  - **If related in any way to authentication?** Your CID, your home facility (REGION/DIVISION/SUBDIVISION, for example AMAS/USA/ZTL), and the facility upon which you noticed the issue (same format). Please note that Scheddy currently only supports VATUSA for authentication.

How Do I Submit a Good Bug Report?

> You must **NEVER** report security related issues, vulnerabilities or bugs including sensitive information to the issue tracker, or elsewhere in public. Instead sensitive bugs must be sent by email to wm@ztlartcc.org.

We use GitHub issues to track bugs and errors. If you run into an issue with the project:

- Open an [Issue](https://github.com/ZTL-ARTCC/scheddy/issues/new). (Since we can’t be sure at this point whether it is a bug or not, we ask you not to talk about a bug yet and not to label the issue.)
- Explain the behavior you would expect and the actual behavior.
- Please provide as much context as possible and describe the reproduction steps that someone else can follow to recreate the issue on their own. This usually includes your code. For good bug reports you should isolate the problem and create a reduced test case.
- Provide the information you collected in the previous section.

Once it’s filed:

- The project team will label the issue accordingly.
- A team member will try to reproduce the issue with your provided steps. If there are no reproduction steps or no obvious way to reproduce the issue, the team will ask you for those steps and mark the issue as needs-repro. Bugs with the needs-repro tag will not be addressed until they are reproduced.
- If the team is able to reproduce the issue, it will be marked needs-fix, as well as possibly other tags (such as critical), and the issue will be left to be implemented by someone.

## Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for Scheddy, including completely new features and minor improvements to existing functionality. Following these guidelines will help maintainers and the community to understand your suggestion and find related suggestions.
Before Submitting an Enhancement

- Make sure that you are using the latest version.
- Read the documentation carefully and find out if the functionality is already covered, maybe by an individual configuration.
- Perform a search to see if the enhancement has already been suggested. If it has, add a comment to the existing issue instead of opening a new one.
- Find out whether your idea fits with the scope and aims of the project. It’s up to you to make a strong case to convince the project’s developers of the merits of this feature. Keep in mind that we want features that will be useful to the majority of our users and not just a small subset. If you’re just targeting a minority of users, consider writing an add-on/plugin library.
  - Remember that Scheddy is primarily maintained to meet the needs of ZTL. While we are ABSOLUTELY open to suggestions from other facilities, keep in mind that requests from within our own team will be prioritized by the ZTL development team.

## How Do I Submit a Good Enhancement Suggestion?

Enhancement suggestions are tracked as GitHub issues.

- Use a clear and descriptive title for the issue to identify the suggestion.
- Provide a step-by-step description of the suggested enhancement in as many details as possible.
- Describe the current behavior and explain which behavior you expected to see instead and why. At this point you can also tell which alternatives do not work for you.
- You may want to include screenshots or screen recordings which help you demonstrate the steps or point out the part which the suggestion is related to.
- Explain why this enhancement would be useful to most Scheddy users. You may also want to point out the other projects that solved it better and which could serve as inspiration.

## Code Contributions

This is the real meat. We greatly appreciate code contributions. To start, the basic rules:

- Work on already-filed issues should be prioritized, but you are welcome to work on other stuff too.
- If an issue has the `not approved` tag, work on it is NOT APPROVED, for whatever reason, and PRs for that issue will be ignored or closed unless you can make a very strong case as to why we should merge it anyway.
- If an issue has the `td-only` tag, work on it is NOT APPROVED, because the issue usually relates to a large or very important part of the codebase, that should be reserved for the primary maintainer. PRs against one of these issues will be heavily scrutinized, and may take longer to review.
- If an issue has the `slottificate()` tag, work on it relates to the dreaded `slottificate()` function, which is a wildly complicated behemoth that calculates slot avaliability. Here be dragons! It's very easy to break this logic.
- Otherwise, any issue with the `approved` tag is fair-game!

Aside from this, work on whatever you want, and submit it via a PR. It'll be reviewed by a member of our team, and merged if it's a good fit!

## The paperwork

Scheddy is licensed under the AGPL 3.0 license. By submitting any contributions to this repository, you agree to the terms of this license, and are releasing your changes into the public under the terms of this license.

### Here's what this means for you:

- You are giving up any rights you may have had to claim copyright or patents on your contribution. This means: if you hold a patent, and used it to write your contribution, you are automatically granting anyone who uses the code at any point in the future, an irrevocable license to ues that patent.
- We give up that right too. If a government, for some reason, issued us a patent on Scheddy, anyone and everyone is automatically granted an irrevocable license to use that patent.
- If you make any changes to Scheddy, and subsequently use\* or distribute them publicly\*\*, you _MUST_ release your changes as open-source code, also under the terms of the AGPL. You must retain credit to the original authors too, along with documenting the changes you made (git commits count).
- Scheddy has no warranty. If you have trouble, that's on you. If you (to our amazement) managed to hurt yourself with Scheddy, it's on you. While we'll try to help you with software issues, we aren't guaranteeing anything.
- You can't sue us.

\*for example, if your facility hosts a public Scheddy instance

\*\* network use counts as distribution!

### Here's what this does NOT mean for you:

- "I can't change the Scheddy code." Nope. Go ahead! You don't even have to tell anyone. But if you use or distribute it publicly, you must share your changes, and preferably submit them upstream, to make Scheddy better for everyone!
- "I am giving up any ownership you may have had over your contribution." While you do retain ownership over your contribution, you are giving up your copyright, and making that code public. You don't get to dictate how your code is used.

### Developer Certificate of Origin

Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.
1 Letterman Drive
Suite D4700
San Francisco, CA, 94129

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.

Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
have the right to submit it under the open source license
indicated in the file; or

(b) The contribution is based upon previous work that, to the best
of my knowledge, is covered under an appropriate open source
license and I have the right under that license to submit that
work with modifications, whether created in whole or in part
by me, under the same open source license (unless I am
permitted to submit under a different license), as indicated
in the file; or

(c) The contribution was provided directly to me by some other
person who certified (a), (b) or (c) and I have not modified
it.

(d) I understand and agree that this project and the contribution
are public and that a record of the contribution (including all
personal information I submit with it, including my sign-off) is
maintained indefinitely and may be redistributed consistent with
this project or the open source license(s) involved.

### Disclaimer

This is not legal advice. We aren't lawyers. We might be completley wrong about this stuff, but above is our interpretation of the relevant rules. You should read [the full terms of the license](LICENSE.md) if you're concerned about that sort of thing.
